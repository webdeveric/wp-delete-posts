import React from 'react';
import { delay, sectostr } from './helpers';
import ProgressBar from './ProgressBar';
import '../css/main.scss';

export default class DeletePostsApp extends React.Component
{
  constructor(props)
  {
    super(props);

    this.urls = null;

    this.state = {
      urls: '',
      delay: 100,
      batchSize: 10,
      forceDelete: false,
      itemsCompleted: 0,
      itemsTotal: 0,
      running: false,
      startTime: null,
      endTime: null,
      durations: [],
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  createBatchURLs()
  {
    this.urls = this.state.urls.trim().split(/\n+/).map( s => s.trim() ).filter( v => v ).reverse();

    return this.urls;
  }

  getBatchURLs()
  {
    return this.urls ? this.urls : this.createBatchURLs();
  }

  getNextBatch()
  {
    const batch = this.getBatchURLs().splice( 0 - this.state.batchSize );

    return batch.length ? batch : false;
  }

  componentDidMount()
  {
    for ( let name in this.state ) {
      let value = sessionStorage.getItem(`delete-posts-${name}`);

      if ( value !== null ) {
        this.setState({
          [name]: value
        });
      }
    }
  }

  handleInputChange(e)
  {
    const target = e.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });

    sessionStorage.setItem(`delete-posts-${name}`, value );
  }

  handleSubmit(e)
  {
    e.preventDefault();

    this.setState({
      running: true,
      startTime: performance.now(),
      endTime: performance.now(),
    });

    let timer = setInterval( () => {
      if ( this.state.running ) {
        this.setState({
          endTime: performance.now(),
        });
      }
    }, 1000 );

    this.processURLs().then( results => {
      clearInterval( timer );

      this.setState({
        urls: '',
        running: false,
        endTime: performance.now(),
      });

      console.log( results );

      this.urls = null;
      // sessionStorage.removeItem('delete-posts-urls');
    });
  }

  totalDuration()
  {
    return this.state.durations.reduce( ( total, current ) => total + current, 0);
  }

  timeRemaining( remaining )
  {
    return ( this.totalDuration() / this.state.durations.length ) * remaining / 1000;
  }

  async deletePosts( urls )
  {
    const body = new FormData();
    body.set('action', 'delete_post_by_url');
    body.set('nonce', this.props.nonce );
    body.set('forceDelete', this.state.forceDelete );
    urls.forEach( url => body.append('urls[]', url ) );

    const options = {
      method: 'POST',
      body,
      mode: 'same-origin',
      credentials: 'same-origin',
      cache: 'no-store',
      redirect: 'error',
    };

    try {
      const response = await fetch( this.props.ajaxurl, options );
      const content = await response.json();
      return content;
    } catch ( err ) {
      console.error( err );
      return err;
    }
  }

  async processURLs()
  {
    let batch = false;
    let results = Object.create(null);

    this.setState({
      itemsCompleted: 0,
      itemsTotal: this.getBatchURLs().length,
    });

    while ( (batch = this.getNextBatch()) !== false ) {
      const start = performance.now();

      let json = await this.deletePosts( batch );

      if ( json.success ) {
        results = Object.assign( results, json.data );
      }

      // Don't delay on the last batch
      if ( this.urls.length && this.state.delay ) {
        await delay( this.state.delay );
      }

      this.setState( prevState => ({
        itemsCompleted: prevState.itemsCompleted + batch.length,
        // This stores the average time it took to process one URL
        durations: [ ...prevState.durations, (performance.now() - start) / this.state.batchSize ],
      }));
    }

    return results;
  }

  render()
  {
    const formClass = this.state.running ? 'is-running' : 'not-running';
    const duration = sectostr( (this.state.endTime - this.state.startTime) / 1000 );
    const timeRemaining = this.urls ? sectostr( this.timeRemaining( this.urls.length ) ) : '';

    return (
      <div>
        <form onSubmit={this.handleSubmit} className={formClass}>

          <div className="form-section">
            <label htmlFor="urls">Enter URLs below</label>
            <textarea className="urls" required name="urls" placeholder="Enter your URLs here" value={this.state.urls} onChange={this.handleInputChange} readOnly={this.state.running} />
          </div>

          <div className="form-section">
            <div className="inline-section">

              <label htmlFor="delay">Delay between requests (ms)</label>
              <input type="number" min="1" name="delay" value={this.state.delay} onChange={this.handleInputChange} />

            </div><div className="inline-section">

              <label htmlFor="batchSize">Batch size</label>
              <input type="number" min="1" name="batchSize" value={this.state.batchSize} onChange={this.handleInputChange} />

            </div><div className="inline-section">

              <label htmlFor="forceDelete">Force delete (skips trash)</label>
              <input type="checkbox" name="forceDelete" value="true" checked={this.state.forceDelete} onChange={this.handleInputChange} disabled={this.state.running} />

            </div>
          </div>

          <div className="form-section">
            <ProgressBar timeRemaining={timeRemaining} duration={duration} max={this.state.itemsTotal} value={this.state.itemsCompleted}/>
          </div>

          <div className="form-section">
            <button type="submit" className="button button-primary" disabled={this.state.running}>Delete Posts</button>
          </div>

        </form>
      </div>
    );
  }
}

DeletePostsApp.propTypes = {
  ajaxurl: React.PropTypes.string,
  nonce: React.PropTypes.string,
};

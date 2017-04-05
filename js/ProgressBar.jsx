import React from 'react';
import '../css/progress-bar.scss';

export default class ProgressBar extends React.Component
{
  constructor(props)
  {
    super(props);
  }

  render() {
    return (
      <div className="progress-bar-component">
        <output className="duration">{this.props.duration}</output>
        <output className="time-remaining">{this.props.timeRemaining}</output>
        <progress className="progress-bar" max={this.props.max} value={this.props.value}></progress>
      </div>
    );
  }
}

ProgressBar.propTypes = {
  duration: React.PropTypes.string,
  timeRemaining: React.PropTypes.string,
  value: React.PropTypes.number,
  max: React.PropTypes.number,
};

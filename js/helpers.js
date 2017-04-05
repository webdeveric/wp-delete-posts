export function delay(ms)
{
  return new Promise( resolve => setTimeout( resolve, ms ) );
}

export function chunk( data, size = 1 )
{
  const chunks = [];

  for ( let c = 0, i = 0, l = data.length ; i < l ; ) {
    chunks[ c++ ] = data.slice( i, i += size );
  }

  return chunks;
}

export function sectostr( totalSeconds )
{
  if ( ! isFinite(totalSeconds) ) {
    return '';
  }

  const time = {
    day:    Math.floor( totalSeconds / 86400 ),
    hour:   Math.floor( totalSeconds % 86400 / 3600 ),
    minute: Math.floor( totalSeconds % 3600 / 60 ),
    second: ( totalSeconds % 3600 % 60 ).toLocaleString('en-US', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }),
  };

  let output = '';

  for ( let key in time ) {
    let value = time[ key ]

    if ( value ) {
      output += ` ${value} ${key}`;

      if ( value > 1 ) {
        output += 's';
      }
    }
  }

  return output.trim();
}

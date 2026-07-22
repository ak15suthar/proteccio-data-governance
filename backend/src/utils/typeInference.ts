export function inferDataType(values: any[]): string {
  const nonNullValues = values.filter(v => v !== null && v !== undefined && v !== '');

  if (nonNullValues.length === 0) return 'string';

  const typeCounts: Record<string, number> = {
    integer: 0,
    float: 0,
    boolean: 0,
    date: 0,
    datetime: 0,
    email: 0,
    url: 0,
    string: 0,
  };

  const patterns: Record<string, RegExp> = {
    integer: /^-?\d+$/,
    float: /^-?\d+\.\d+$/,
    boolean: /^(true|false|yes|no|0|1)$/i,
    date: /^\d{4}[-\/](?:0[1-9]|1[0-2])[-\/](?:0[1-9]|[12][0-9]|3[01])$/,
    datetime: /^\d{4}[-\/](?:0[1-9]|1[0-2])[-\/](?:0[1-9]|[12][0-9]|3[01])[T ]\d{2}:\d{2}/,
    email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    url: /^https?:\/\//,
  };

  for (const value of nonNullValues.slice(0, 100)) {
    const strValue = String(value).trim();
    let matched = false;

    for (const [type, pattern] of Object.entries(patterns)) {
      if (pattern.test(strValue)) {
        typeCounts[type]++;
        matched = true;
        break;
      }
    }

    if (!matched) {
      typeCounts.string++;
    }
  }

  const total = nonNullValues.length;
  let bestType = 'string';
  let bestScore = 0;

  for (const [type, count] of Object.entries(typeCounts)) {
    const score = count / total;
    if (score > bestScore && score >= 0.8) {
      bestScore = score;
      bestType = type;
    }
  }

  return bestType;
}

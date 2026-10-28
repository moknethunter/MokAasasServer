import os from 'node:os';

export interface NetworkEndpoint {
  label: string;
  url: string;
}

export function getNetworkInfo(port: number): NetworkEndpoint[] {
  const urls: NetworkEndpoint[] = [{ label: 'Local', url: `http://localhost:${port}` }];
  const nets = os.networkInterfaces();

  for (const name of Object.keys(nets)) {
    for (const net of nets[name] ?? []) {
      if (net.family === 'IPv4' && !net.internal) {
        urls.push({ label: `LAN (${name})`, url: `http://${net.address}:${port}` });
      }
    }
  }
  return urls;
}

import fs from 'fs';

export default function getKafkaConfig(
  filePath: string | fs.PathOrFileDescriptor
) {
  const data = fs.readFileSync(filePath, 'utf8').toString().split('\n');

  return data.reduce<Record<string, string>>((config, line) => {
    const [key, value] = line.split('=');
    if (key && value) {
      config[key] = value.replace('\r', '');
    }
    return config;
  }, {});
}

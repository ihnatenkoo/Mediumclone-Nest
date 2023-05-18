import { DataSource, DataSourceOptions } from 'typeorm';
import { join } from 'path';
import { dataSourceOptions } from './data-source';

const dataSourceSeedsOptions: DataSourceOptions = {
  ...dataSourceOptions,
  migrations: [join(__dirname, 'seeds', '*.ts')],
};

const dataSourceSeeds = new DataSource(dataSourceSeedsOptions);
export default dataSourceSeeds;

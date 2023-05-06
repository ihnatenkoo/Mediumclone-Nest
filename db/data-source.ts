import { DataSource, DataSourceOptions } from 'typeorm';
import { join } from 'path';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  database: 'mediumclone',
  username: 'mediumclone',
  password: '7777',
  entities: [join(__dirname, '../', '**', '*.entity.js')],
  migrations: [join(__dirname, 'migrations', '*.js')],
  synchronize: false,
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;

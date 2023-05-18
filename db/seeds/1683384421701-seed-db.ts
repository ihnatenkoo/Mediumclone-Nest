import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedDb16833844217011683384421701 implements MigrationInterface {
  name = 'SeedDb1683384421701';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO tags (name) VALUES ('reactjs'), ('angularjs')`,
    );

    //passwords are 12345
    await queryRunner.query(
      `INSERT INTO users (username, email, password) VALUES ('dima', 'dima@gmail.com', '$2b$10$u9V1nMIbNTJq4rgc7dBduus5EH79tEuUBP8VLqf4FKxg/iRxUiF9q'), ('alex', 'alex@gmail.com', '$2b$10$u9V1nMIbNTJq4rgc7dBduus5EH79tEuUBP8VLqf4FKxg/iRxUiF9q')`,
    );

    await queryRunner.query(
      `INSERT INTO articles (slug, title, description, body, "tagList", "authorId") VALUES ('first-article', 'First article', 'First article description', 'First article body', 'first,article', 1), ('second-article', 'second article', 'second article description', 'second article body', 'second,article', 1), ('third-article', 'third article', 'third article description', 'third article body', 'third,article', 2)`,
    );
  }

  public async down(): Promise<void> {
    return null;
  }
}

import { entity, field } from 'sls-api-decorators/models';

@entity({
  table: 'Users',
  storage: 'DynamoDB',
})
export class User {
  @field()
  public id: string;

  @field()
  public name: string;

  @field()
  public email: string;

  constructor() { }
}

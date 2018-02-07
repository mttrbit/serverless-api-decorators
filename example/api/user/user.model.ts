import { entity, field } from 'sls-api-decorators/models';

@entity({
  table: 'Users',
  storage: 'DynamoDB',
})
export class User {
  @field(null)
  public id: string;

  @field(null)
  public name: string;

  @field(null)
  public email: string;

  constructor() { }
}

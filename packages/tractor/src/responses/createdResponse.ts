import { Guid } from '@cashfarm/lang';
import { Identity } from '@cashfarm/plow';

export class CreatedResponse {
  public readonly status = 201;

  constructor(
    public message: string,
    public id: string | number | Guid | Identity<any>,
    public resourceUrl?: string
  ) {
    if (id instanceof Identity)
      this.id = id.toString();
  }
}

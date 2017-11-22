import { Identity } from '@cashfarm/plow';

export class NotFoundResponse {
  public message: string;

  constructor(
    resourceName: string,
    public id: string | number | Identity<any>
  ) {
    if (id instanceof Identity)
      this.id = id.toString();

    this.message = `${resourceName} with id ${this.id} could not be found`;
  }
}

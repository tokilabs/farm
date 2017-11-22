import * as Hapi from 'hapi';
import { hydrate } from '@cashfarm/lang';

export class Request {

  constructor(
    protected params: any,
    protected query: any,
    protected payload: any) {
    this.deserializeData();
  }

  protected deserializeData() {
    const data = {};

    if (this.params) {
      Object.keys(this.payload).forEach(k => {
        data[k] = this.payload[k];
      });
    }

    if (this.payload) {
      Object.keys(this.payload).forEach(k => {
        data[k] = this.payload[k];
      });
    }

    if (this.query) {
      Object.keys(this.query).forEach(k => {
        data[k] = this.query[k];
      });
    }

    hydrate(this, data);
  }
}

export default Request;

import { Guid } from '@cashfarm/lang';

/**
 * Acknowledge response
 *
 * This response should be used for long runing commands where the result
 * will be eventually available at `resultUrl`
 *
 * @export
 * @class AckResponse
 */
export class AckResponse {
  constructor(
    public message: string,
    public resultUrl?: string
  ) {}
}

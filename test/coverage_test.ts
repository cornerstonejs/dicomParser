/* eslint-disable no-unused-expressions */
import { expect } from 'chai';

import * as dicomParser from '../src/index';

describe('A test that pulls in all modules', function () {
  it('pulls in all modules', function () {
    expect(dicomParser).to.exist;
  });
});

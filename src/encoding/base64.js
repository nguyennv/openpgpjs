/* OpenPGP radix-64/base64 string encoding/decoding
 * Copyright 2005 Herbert Hanewinkel, www.haneWIN.de
 * version 1.0, check www.haneWIN.de for the latest version
 *
 * This software is provided as-is, without express or implied warranty.
 * Permission to use, copy, modify, distribute or sell this software, with or
 * without fee, for any purpose and by any individual or organization, is hereby
 * granted, provided that the above copyright notice and this paragraph appear
 * in all copies. Distribution as a part of an application or binary must
 * include the above copyright notice in the documentation and/or other materials
 * provided with the application or distribution.
 */

/**
 * @module encoding/base64
 */

import { transform as streamTransform } from '@openpgp/web-stream-tools';
import util from '../util';

const Buffer = util.getNodeBuffer();

let encodeChunk;
let decodeChunk;
if (Buffer) {
  encodeChunk = buf => Buffer.from(buf).toString('base64');
  decodeChunk = str => {
    const b = Buffer.from(str, 'base64');
    return new Uint8Array(b.buffer, b.byteOffset, b.byteLength);
  };
} else {
  encodeChunk = buf => btoa(util.uint8ArrayToString(buf));
  decodeChunk = str => util.stringToUint8Array(atob(str));
}

/**
 * Convert binary array to radix-64
 * @param {Uint8Array | ReadableStream<Uint8Array>} data - Uint8Array to convert
 * @returns {String | ReadableStream<String>} Radix-64 version of input string.
 * @static
 */
export function encode(data) {
  let buf = new Uint8Array();
  return streamTransform(data, value => {
    buf = util.concatUint8Array([buf, value]);
    const r = [];
    const bytesPerLine = 45; // 60 chars per line * (3 bytes / 4 chars of base64).
    const lines = Math.floor(buf.length / bytesPerLine);
    const bytes = lines * bytesPerLine;
    const encoded = encodeChunk(buf.subarray(0, bytes));
    for (let i = 0; i < lines; i++) {
      r.push(encoded.substr(i * 60, 60));
      r.push('\n');
    }
    buf = buf.subarray(bytes);
    return r.join('');
  }, () => (buf.length ? encodeChunk(buf) + '\n' : ''));
}

/**
 * Convert radix-64 to binary array
 * @param {String | ReadableStream<String>} data - Radix-64 string to convert
 * @returns {Uint8Array | ReadableStream<Uint8Array>} Binary array version of input string.
 * @static
 */
export function decode(data) {
  let buf = '';
  return streamTransform(data, value => {
    buf += value;

    // Count how many whitespace characters there are in buf
    let spaces = 0;
    const spacechars = [' ', '\t', '\r', '\n'];
    for (let i = 0; i < spacechars.length; i++) {
      const spacechar = spacechars[i];
      for (let pos = buf.indexOf(spacechar); pos !== -1; pos = buf.indexOf(spacechar, pos + 1)) {
        spaces++;
      }
    }

    // Backtrack until we have 4n non-whitespace characters
    // that we can safely base64-decode
    let length = buf.length;
    for (; length > 0 && (length - spaces) % 4 !== 0; length--) {
      if (spacechars.includes(buf[length])) spaces--;
    }

    const decoded = decodeChunk(buf.substr(0, length));
    buf = buf.substr(length);
    return decoded;
  }, () => decodeChunk(buf));
}

/**
 * Convert a Base-64 encoded string an array of 8-bit integer
 *
 * Note: accepts both Radix-64 and URL-safe strings
 * @param {String} base64 - Base-64 encoded string to convert
 * @returns {Uint8Array} An array of 8-bit integers.
 */
export function b64ToUint8Array(base64) {
  return decode(base64.replace(/-/g, '+').replace(/_/g, '/'));
}

/**
 * Convert an array of 8-bit integer to a Base-64 encoded string
 * @param {Uint8Array} bytes - An array of 8-bit integers to convert
 * @param {bool} url - If true, output is URL-safe
 * @returns {String} Base-64 encoded string.
 */
export function uint8ArrayToB64(bytes, url) {
  let encoded = encode(bytes).replace(/[\r\n]/g, '');
  if (url) {
    encoded = encoded.replace(/[+]/g, '-').replace(/[/]/g, '_').replace(/[=]/g, '');
  }
  return encoded;
}

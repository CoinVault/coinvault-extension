import * as cbor from '@ipld/dag-cbor';
import { CID } from 'multiformats/cid';
import { sha256 } from 'multiformats/hashes/sha2';

// a map of all supported CID hashing algorithms. This map is used to select the appropriate hasher
// when generating a CID to compare against a provided CID
const hashers = {
  [sha256.code]: sha256,
};

// a map of all support codecs.This map is used to select the appropriate codec
// when generating a CID to compare against a provided CID
const codecs = {
  [cbor.code]: cbor,
};

/**
 * generates a CID for the provided payload
 * @param payload
 * @param codecCode - the codec to use. Defaults to cbor
 * @param multihashCode - the multihasher to use. Defaults to sha256
 * @returns payload CID
 * @throws {Error} codec is not supported
 * @throws {Error} encoding fails
 * @throws {Error} if hasher is not supported
 */
export async function generateCid(payload: any, codecCode = cbor.code, multihashCode = sha256.code): Promise<CID> {
  const codec = codecs[codecCode];
  if (!codec) {
    throw new Error(`codec [${codecCode}] not supported`);
  }

  const hasher = hashers[multihashCode];
  if (!hasher) {
    throw new Error(`multihash code [${multihashCode}] not supported`);
  }

  const payloadBytes = codec.encode(payload);
  const payloadHash = await hasher.digest(payloadBytes);

  return await CID.createV1(codec.code, payloadHash);
}

/**
 * Gets the CID of the given message.
 * NOTE: `encodedData` is ignored when computing the CID of message.
 */
export async function getCid(message: any): Promise<CID> {
  const messageCopy = { ...message };

  if (messageCopy['encodedData'] !== undefined) {
    delete (messageCopy as any).encodedData;
  }

  const cid = await generateCid(messageCopy);
  return cid;
}

export function parseCid(str: string): CID {
  const cid = CID.parse(str).toV1();

  const cod = codecs as any;
  const has = hashers as any;

  if (!cod[cid.code]) {
    throw new Error(`codec [${cid.code}] not supported`);
  }

  if (!has[cid.multihash.code]) {
    throw new Error(`multihash code [${cid.multihash.code}] not supported`);
  }

  return cid;
}

/**
 * Compares two CIDs given in lexicographical order.
 * @returns 1 if `a` is larger than `b`; -1 if `a` is smaller/older than `b`; 0 otherwise (same message)
 */
export function compareCids(a: CID, b: CID): number {
  // the < and > operators compare strings in lexicographical order
  if (a > b) {
    return 1;
  } else if (a < b) {
    return -1;
  } else {
    return 0;
  }
}
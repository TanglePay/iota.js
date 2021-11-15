// Copyright 2020 IOTA Stiftung
// SPDX-License-Identifier: Apache-2.0
import type { ReadStream, WriteStream } from "@iota/util.js";
import { IIssuerFeatureBlock, ISSUER_FEATURE_BLOCK_TYPE } from "../../models/featureBlocks/IIssuerFeatureBlock";
import { deserializeAddress, MIN_ADDRESS_LENGTH, serializeAddress } from "../addresses/addresses";
import { SMALL_TYPE_LENGTH } from "../commonDataTypes";

/**
 * The minimum length of a issuer feature block binary representation.
 */
export const MIN_ISSUER_FEATURE_BLOCK_LENGTH: number = SMALL_TYPE_LENGTH + MIN_ADDRESS_LENGTH;

/**
 * Deserialize the issuer feature block from binary.
 * @param readStream The stream to read the data from.
 * @returns The deserialized object.
 */
export function deserializeIssuerFeatureBlock(readStream: ReadStream): IIssuerFeatureBlock {
    if (!readStream.hasRemaining(MIN_ISSUER_FEATURE_BLOCK_LENGTH)) {
        throw new Error(
            `Issuer Feature Block data is ${readStream.length()} in length which is less than the minimimum size required of ${MIN_ISSUER_FEATURE_BLOCK_LENGTH}`
        );
    }

    const type = readStream.readUInt8("issuerFeatureBlock.type");
    if (type !== ISSUER_FEATURE_BLOCK_TYPE) {
        throw new Error(`Type mismatch in issuerFeatureBlock ${type}`);
    }

    const address = deserializeAddress(readStream);

    return {
        type: ISSUER_FEATURE_BLOCK_TYPE,
        address
    };
}

/**
 * Serialize the issuer feature block to binary.
 * @param writeStream The stream to write the data to.
 * @param object The object to serialize.
 */
export function serializeIssuerFeatureBlock(writeStream: WriteStream, object: IIssuerFeatureBlock): void {
    writeStream.writeUInt8("issuerFeatureBlock.type", object.type);
    serializeAddress(writeStream, object.address);
}

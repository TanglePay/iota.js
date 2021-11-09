import { TREASURY_TRANSACTION_PAYLOAD_TYPE } from "../../models/payloads/ITreasuryTransactionPayload.mjs";
import { TYPE_LENGTH } from "../commonDataTypes.mjs";
import { deserializeTreasuryInput, MIN_TREASURY_INPUT_LENGTH, serializeTreasuryInput } from "../inputs/treasuryInput.mjs";
import { deserializeTreasuryOutput, MIN_TREASURY_OUTPUT_LENGTH, serializeTreasuryOutput } from "../outputs/treasuryOutput.mjs";
/**
 * The minimum length of a treasury transaction payload binary representation.
 */
export const MIN_TREASURY_TRANSACTION_PAYLOAD_LENGTH = TYPE_LENGTH + MIN_TREASURY_INPUT_LENGTH + MIN_TREASURY_OUTPUT_LENGTH;
/**
 * Deserialize the treasury transaction payload from binary.
 * @param readStream The stream to read the data from.
 * @returns The deserialized object.
 */
export function deserializeTreasuryTransactionPayload(readStream) {
    if (!readStream.hasRemaining(MIN_TREASURY_TRANSACTION_PAYLOAD_LENGTH)) {
        throw new Error(`Treasury Transaction Payload data is ${readStream.length()} in length which is less than the minimimum size required of ${MIN_TREASURY_TRANSACTION_PAYLOAD_LENGTH}`);
    }
    const type = readStream.readUInt32("payloadTreasuryTransaction.type");
    if (type !== TREASURY_TRANSACTION_PAYLOAD_TYPE) {
        throw new Error(`Type mismatch in payloadTreasuryTransaction ${type}`);
    }
    const input = deserializeTreasuryInput(readStream);
    const output = deserializeTreasuryOutput(readStream);
    return {
        type: TREASURY_TRANSACTION_PAYLOAD_TYPE,
        input,
        output
    };
}
/**
 * Serialize the treasury transaction payload to binary.
 * @param writeStream The stream to write the data to.
 * @param object The object to serialize.
 */
export function serializeTreasuryTransactionPayload(writeStream, object) {
    writeStream.writeUInt32("payloadTreasuryTransaction.type", object.type);
    serializeTreasuryInput(writeStream, object.input);
    serializeTreasuryOutput(writeStream, object.output);
}

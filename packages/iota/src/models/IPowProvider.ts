// Copyright 2020 IOTA Stiftung
// SPDX-License-Identifier: Apache-2.0
/**
 * Perform the POW on a block.
 */
export interface IPowProvider {
    /**
     * Perform pow on the block and return the nonce of at least targetScore.
     * @param block The block to process.
     * @param targetScore The target score.
     * @returns The nonce as a string.
     */
    pow(block: Uint8Array, targetScore: number): Promise<string>;
}

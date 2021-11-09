import type { AddressTypes } from "../addresses/addressTypes";
import type { FeatureBlockTypes } from "../featureBlocks/featureBlockTypes";
import type { INativeToken } from "../INativeToken";
import type { ITypeBase } from "../ITypeBase";
/**
 * The global type for the NFT output.
 */
export declare const NFT_OUTPUT_TYPE = 6;
/**
 * NFT output.
 */
export interface INftOutput extends ITypeBase<6> {
    /**
     * The address associated with the output.
     */
    address: AddressTypes;
    /**
     * The amount of IOTA tokens held by the output.
     */
    amount: number;
    /**
     * The native tokens held by the output.
     */
    nativeTokens: INativeToken[];
    /**
     * Unique identifier of the NFT, which is the BLAKE2b-160 hash of the Output ID that created it.
     */
    nftId: string;
    /**
     * Binary metadata attached immutably to the NFT.
     */
    immutableData: string;
    /**
     * Blocks contained by the output.
     */
    blocks: FeatureBlockTypes[];
}

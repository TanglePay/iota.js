"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sha256 = void 0;
// Copyright 2020 IOTA Stiftung
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable no-bitwise */
/* eslint-disable unicorn/prefer-math-trunc */
/**
 * Class to help with Sha256 scheme.
 * TypeScript conversion from https://github.com/emn178/js-sha256
 */
class Sha256 {
    /**
     * Create a new instance of Sha256.
     * @param bits The number of bits.
     */
    constructor(bits = Sha256.SIZE_256) {
        /**
         * Blocks.
         * @internal
         */
        this._blocks = [];
        if (bits !== Sha256.SIZE_224 && bits !== Sha256.SIZE_256) {
            throw new Error("Only 224 or 256 bits are supported");
        }
        this._blocks = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        if (bits === Sha256.SIZE_224) {
            this._h0 = 0xC1059ED8;
            this._h1 = 0x367CD507;
            this._h2 = 0x3070DD17;
            this._h3 = 0xF70E5939;
            this._h4 = 0xFFC00B31;
            this._h5 = 0x68581511;
            this._h6 = 0x64F98FA7;
            this._h7 = 0xBEFA4FA4;
        }
        else {
            this._h0 = 0x6A09E667;
            this._h1 = 0xBB67AE85;
            this._h2 = 0x3C6EF372;
            this._h3 = 0xA54FF53A;
            this._h4 = 0x510E527F;
            this._h5 = 0x9B05688C;
            this._h6 = 0x1F83D9AB;
            this._h7 = 0x5BE0CD19;
        }
        this._bits = bits;
        this._block = 0;
        this._start = 0;
        this._bytes = 0;
        this._hBytes = 0;
        this._lastByteIndex = 0;
        this._finalized = false;
        this._hashed = false;
        this._first = true;
    }
    /**
     * Perform Sum 256 on the data.
     * @param data The data to operate on.
     * @returns The sum 256 of the data.
     */
    static sum256(data) {
        const b2b = new Sha256(Sha256.SIZE_256);
        b2b.update(data);
        return b2b.digest();
    }
    /**
     * Perform Sum 224 on the data.
     * @param data The data to operate on.
     * @returns The sum 224 of the data.
     */
    static sum224(data) {
        const b2b = new Sha256(Sha256.SIZE_224);
        b2b.update(data);
        return b2b.digest();
    }
    /**
     * Update the hash with the data.
     * @param message The data to update the hash with.
     * @returns The instance for chaining.
     */
    update(message) {
        if (this._finalized) {
            throw new Error("The hash has already been finalized.");
        }
        let index = 0;
        let i;
        const length = message.length;
        const blocks = this._blocks;
        while (index < length) {
            if (this._hashed) {
                this._hashed = false;
                blocks[0] = this._block;
                blocks[1] = 0;
                blocks[2] = 0;
                blocks[3] = 0;
                blocks[4] = 0;
                blocks[5] = 0;
                blocks[6] = 0;
                blocks[7] = 0;
                blocks[8] = 0;
                blocks[9] = 0;
                blocks[10] = 0;
                blocks[11] = 0;
                blocks[12] = 0;
                blocks[13] = 0;
                blocks[14] = 0;
                blocks[15] = 0;
                blocks[16] = 0;
            }
            for (i = this._start; index < length && i < 64; ++index) {
                blocks[i >> 2] |= message[index] << Sha256.SHIFT[i++ & 3];
            }
            this._lastByteIndex = i;
            this._bytes += i - this._start;
            if (i >= 64) {
                this._block = blocks[16];
                this._start = i - 64;
                this.hash();
                this._hashed = true;
            }
            else {
                this._start = i;
            }
        }
        if (this._bytes > 4294967295) {
            this._hBytes += Math.trunc(this._bytes / 4294967296);
            this._bytes %= 4294967296;
        }
        return this;
    }
    /**
     * Get the digest.
     * @returns The digest.
     */
    digest() {
        this.finalize();
        const h0 = this._h0;
        const h1 = this._h1;
        const h2 = this._h2;
        const h3 = this._h3;
        const h4 = this._h4;
        const h5 = this._h5;
        const h6 = this._h6;
        const h7 = this._h7;
        const arr = [
            (h0 >> 24) & 0xFF, (h0 >> 16) & 0xFF, (h0 >> 8) & 0xFF, h0 & 0xFF,
            (h1 >> 24) & 0xFF, (h1 >> 16) & 0xFF, (h1 >> 8) & 0xFF, h1 & 0xFF,
            (h2 >> 24) & 0xFF, (h2 >> 16) & 0xFF, (h2 >> 8) & 0xFF, h2 & 0xFF,
            (h3 >> 24) & 0xFF, (h3 >> 16) & 0xFF, (h3 >> 8) & 0xFF, h3 & 0xFF,
            (h4 >> 24) & 0xFF, (h4 >> 16) & 0xFF, (h4 >> 8) & 0xFF, h4 & 0xFF,
            (h5 >> 24) & 0xFF, (h5 >> 16) & 0xFF, (h5 >> 8) & 0xFF, h5 & 0xFF,
            (h6 >> 24) & 0xFF, (h6 >> 16) & 0xFF, (h6 >> 8) & 0xFF, h6 & 0xFF
        ];
        if (this._bits === Sha256.SIZE_256) {
            arr.push((h7 >> 24) & 0xFF, (h7 >> 16) & 0xFF, (h7 >> 8) & 0xFF, h7 & 0xFF);
        }
        return Uint8Array.from(arr);
    }
    /**
     * Finalize the hash.
     * @internal
     */
    finalize() {
        if (this._finalized) {
            return;
        }
        this._finalized = true;
        const blocks = this._blocks;
        const i = this._lastByteIndex;
        blocks[16] = this._block;
        blocks[i >> 2] |= Sha256.EXTRA[i & 3];
        this._block = blocks[16];
        if (i >= 56) {
            if (!this._hashed) {
                this.hash();
            }
            blocks[0] = this._block;
            blocks[1] = 0;
            blocks[2] = 0;
            blocks[3] = 0;
            blocks[4] = 0;
            blocks[5] = 0;
            blocks[6] = 0;
            blocks[7] = 0;
            blocks[8] = 0;
            blocks[9] = 0;
            blocks[10] = 0;
            blocks[11] = 0;
            blocks[12] = 0;
            blocks[13] = 0;
            blocks[14] = 0;
            blocks[15] = 0;
            blocks[16] = 0;
        }
        blocks[14] = (this._hBytes << 3) | (this._bytes >>> 29);
        blocks[15] = this._bytes << 3;
        this.hash();
    }
    /**
     * Perform the hash.
     * @internal
     */
    hash() {
        let a = this._h0;
        let b = this._h1;
        let c = this._h2;
        let d = this._h3;
        let e = this._h4;
        let f = this._h5;
        let g = this._h6;
        let h = this._h7;
        const blocks = this._blocks;
        let j;
        let s0;
        let s1;
        let maj;
        let t1;
        let t2;
        let ch;
        let ab;
        let da;
        let cd;
        let bc;
        for (j = 16; j < 64; ++j) {
            // rightrotate
            t1 = blocks[j - 15];
            s0 = ((t1 >>> 7) | (t1 << 25)) ^ ((t1 >>> 18) | (t1 << 14)) ^ (t1 >>> 3);
            t1 = blocks[j - 2];
            s1 = ((t1 >>> 17) | (t1 << 15)) ^ ((t1 >>> 19) | (t1 << 13)) ^ (t1 >>> 10);
            blocks[j] = blocks[j - 16] + s0 + blocks[j - 7] + s1 << 0;
        }
        bc = b & c;
        for (j = 0; j < 64; j += 4) {
            if (this._first) {
                if (this._bits === Sha256.SIZE_224) {
                    ab = 300032;
                    t1 = blocks[0] - 1413257819;
                    h = t1 - 150054599 << 0;
                    d = t1 + 24177077 << 0;
                }
                else {
                    ab = 704751109;
                    t1 = blocks[0] - 210244248;
                    h = t1 - 1521486534 << 0;
                    d = t1 + 143694565 << 0;
                }
                this._first = false;
            }
            else {
                s0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
                s1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
                ab = a & b;
                maj = ab ^ (a & c) ^ bc;
                ch = (e & f) ^ (~e & g);
                t1 = h + s1 + ch + Sha256.K[j] + blocks[j];
                t2 = s0 + maj;
                h = d + t1 << 0;
                d = t1 + t2 << 0;
            }
            s0 = ((d >>> 2) | (d << 30)) ^ ((d >>> 13) | (d << 19)) ^ ((d >>> 22) | (d << 10));
            s1 = ((h >>> 6) | (h << 26)) ^ ((h >>> 11) | (h << 21)) ^ ((h >>> 25) | (h << 7));
            da = d & a;
            maj = da ^ (d & b) ^ ab;
            ch = (h & e) ^ (~h & f);
            t1 = g + s1 + ch + Sha256.K[j + 1] + blocks[j + 1];
            t2 = s0 + maj;
            g = c + t1 << 0;
            c = t1 + t2 << 0;
            s0 = ((c >>> 2) | (c << 30)) ^ ((c >>> 13) | (c << 19)) ^ ((c >>> 22) | (c << 10));
            s1 = ((g >>> 6) | (g << 26)) ^ ((g >>> 11) | (g << 21)) ^ ((g >>> 25) | (g << 7));
            cd = c & d;
            maj = cd ^ (c & a) ^ da;
            ch = (g & h) ^ (~g & e);
            t1 = f + s1 + ch + Sha256.K[j + 2] + blocks[j + 2];
            t2 = s0 + maj;
            f = b + t1 << 0;
            b = t1 + t2 << 0;
            s0 = ((b >>> 2) | (b << 30)) ^ ((b >>> 13) | (b << 19)) ^ ((b >>> 22) | (b << 10));
            s1 = ((f >>> 6) | (f << 26)) ^ ((f >>> 11) | (f << 21)) ^ ((f >>> 25) | (f << 7));
            bc = b & c;
            maj = bc ^ (b & d) ^ cd;
            ch = (f & g) ^ (~f & h);
            t1 = e + s1 + ch + Sha256.K[j + 3] + blocks[j + 3];
            t2 = s0 + maj;
            e = a + t1 << 0;
            a = t1 + t2 << 0;
        }
        this._h0 += Math.trunc(a);
        this._h1 += Math.trunc(b);
        this._h2 += Math.trunc(c);
        this._h3 += Math.trunc(d);
        this._h4 += Math.trunc(e);
        this._h5 += Math.trunc(f);
        this._h6 += Math.trunc(g);
        this._h7 += Math.trunc(h);
    }
}
exports.Sha256 = Sha256;
/**
 * Sha256 256.
 */
Sha256.SIZE_256 = 256;
/**
 * Sha256 224.
 */
Sha256.SIZE_224 = 224;
/**
 * Extra constants.
 * @internal
 */
Sha256.EXTRA = [-2147483648, 8388608, 32768, 128];
/**
 * Shift constants.
 * @internal
 */
Sha256.SHIFT = [24, 16, 8, 0];
/**
 * K.
 * @internal
 */
Sha256.K = Uint32Array.from([
    0x428A2F98, 0x71374491, 0xB5C0FBCF, 0xE9B5DBA5, 0x3956C25B, 0x59F111F1, 0x923F82A4, 0xAB1C5ED5,
    0xD807AA98, 0x12835B01, 0x243185BE, 0x550C7DC3, 0x72BE5D74, 0x80DEB1FE, 0x9BDC06A7, 0xC19BF174,
    0xE49B69C1, 0xEFBE4786, 0x0FC19DC6, 0x240CA1CC, 0x2DE92C6F, 0x4A7484AA, 0x5CB0A9DC, 0x76F988DA,
    0x983E5152, 0xA831C66D, 0xB00327C8, 0xBF597FC7, 0xC6E00BF3, 0xD5A79147, 0x06CA6351, 0x14292967,
    0x27B70A85, 0x2E1B2138, 0x4D2C6DFC, 0x53380D13, 0x650A7354, 0x766A0ABB, 0x81C2C92E, 0x92722C85,
    0xA2BFE8A1, 0xA81A664B, 0xC24B8B70, 0xC76C51A3, 0xD192E819, 0xD6990624, 0xF40E3585, 0x106AA070,
    0x19A4C116, 0x1E376C08, 0x2748774C, 0x34B0BCB5, 0x391C0CB3, 0x4ED8AA4A, 0x5B9CCA4F, 0x682E6FF3,
    0x748F82EE, 0x78A5636F, 0x84C87814, 0x8CC70208, 0x90BEFFFA, 0xA4506CEB, 0xBEF9A3F7, 0xC67178F2
]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2hhMjU2LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NyeXB0by9zaGEyNTYudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsK0JBQStCO0FBQy9CLHNDQUFzQztBQUN0QywrQkFBK0I7QUFDL0IsOENBQThDO0FBQzlDOzs7R0FHRztBQUNILE1BQWEsTUFBTTtJQWtKZjs7O09BR0c7SUFDSCxZQUFZLE9BQWUsTUFBTSxDQUFDLFFBQVE7UUFoSDFDOzs7V0FHRztRQUNjLFlBQU8sR0FBYSxFQUFFLENBQUM7UUE2R3BDLElBQUksSUFBSSxLQUFLLE1BQU0sQ0FBQyxRQUFRLElBQUksSUFBSSxLQUFLLE1BQU0sQ0FBQyxRQUFRLEVBQUU7WUFDdEQsTUFBTSxJQUFJLEtBQUssQ0FBQyxvQ0FBb0MsQ0FBQyxDQUFDO1NBQ3pEO1FBQ0QsSUFBSSxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUVuRSxJQUFJLElBQUksS0FBSyxNQUFNLENBQUMsUUFBUSxFQUFFO1lBQzFCLElBQUksQ0FBQyxHQUFHLEdBQUcsVUFBVSxDQUFDO1lBQ3RCLElBQUksQ0FBQyxHQUFHLEdBQUcsVUFBVSxDQUFDO1lBQ3RCLElBQUksQ0FBQyxHQUFHLEdBQUcsVUFBVSxDQUFDO1lBQ3RCLElBQUksQ0FBQyxHQUFHLEdBQUcsVUFBVSxDQUFDO1lBQ3RCLElBQUksQ0FBQyxHQUFHLEdBQUcsVUFBVSxDQUFDO1lBQ3RCLElBQUksQ0FBQyxHQUFHLEdBQUcsVUFBVSxDQUFDO1lBQ3RCLElBQUksQ0FBQyxHQUFHLEdBQUcsVUFBVSxDQUFDO1lBQ3RC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Q0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLEdBQUcsSUFBSSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksRUFBRSxFQUFFLEdBQUcsSUFBSTtZQUNqRSxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsR0FBRyxJQUFJLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLEdBQUcsSUFBSSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksRUFBRSxFQUFFLEdBQUcsSUFBSTtZQUNqRSxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsR0FBRyxJQUFJLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLEdBQUcsSUFBSSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksRUFBRSxFQUFFLEdBQUcsSUFBSTtZQUNqRSxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsR0FBRyxJQUFJLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLEdBQUcsSUFBSSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksRUFBRSxFQUFFLEdBQUcsSUFBSTtZQUNqRSxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsR0FBRyxJQUFJLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLEdBQUcsSUFBSSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksRUFBRSxFQUFFLEdBQUcsSUFBSTtTQUNwRSxDQUFDO1FBQ0YsSUFBSSxJQUFJLENBQUMsS0FBSyxLQUFLLE1BQU0sQ0FBQyxRQUFRLEVBQUU7WUFDaEMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsR0FBRyxJQUFJLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLEdBQUcsSUFBSSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksRUFBRSxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7U0FDL0U7UUFD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QU0sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO1FBQzVCLElBQUksQ0FBQyxDQUFDO1FBQ04sSUFBSSxFQUFFLENBQUM7UUFDUCxJQUFJLEVBQUUsQ0FBQztRQUNQLElBQUksR0FBRyxDQUFDO1FBQ1IsSUFBSSxFQUFFLENBQUM7UUFDUCxJQUFJLEVBQUUsQ0FBQztRQUNQLElBQUksRUFBRSxDQUFDO1FBQ1AsSUFBSSxFQUFFLENBQUM7UUFDUCxJQUFJLEVBQUUsQ0FBQztRQUNQLElBQUksRUFBRSxDQUFDO1FBQ1AsSUFBSSxFQUFFLENBQUM7UUFFUCxLQUFLLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRTtZQUN0QixjQUFjO1lBQ2QsRUFBRSxHQUFHLE1BQU0sQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7WUFDcEIsRUFBRSxHQUFHLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDekUsRUFBRSxHQUFHLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDbkIsRUFBRSxHQUFHLENBQUMsQ0FBQyxFQUFFLEtBQUssRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7WUFDM0UsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztTQUM3RDtRQUVELEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ1gsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUN4QixJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7Z0JBQ2IsSUFBSSxJQUFJLENBQUMsS0FBSyxLQUFLLE1BQU0sQ0FBQyxRQUFRLEVBQUU7b0JBQ2hDLEVBQUUsR0FBRyxNQUFNLENBQUM7b0JBQ1osRUFBRSxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxVQUFVLENBQUM7b0JBQzVCLENBQUMsR0FBRyxFQUFFLEdBQUcsU0FBUyxJQUFJLENBQUMsQ0FBQztvQkFDeEIsQ0FBQyxHQUFHLEVBQUUsR0FBRyxRQUFRLElBQUksQ0FBQyxDQUFDO2lCQUMxQjtxQkFBTTtvQkFDSCxFQUFFLEdBQUcsU0FBUyxDQUFDO29CQUNmLEVBQUUsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFDO29CQUMzQixDQUFDLEdBQUcsRUFBRSxHQUFHLFVBQVUsSUFBSSxDQUFDLENBQUM7b0JBQ3pCLENBQUMsR0FBRyxFQUFFLEdBQUcsU0FBUyxJQUFJLENBQUMsQ0FBQztpQkFDM0I7Z0JBQ0QsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7YUFDdkI7aUJBQU07Z0JBQ0gsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUNuRixFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2xGLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUNYLEdBQUcsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO2dCQUN4QixFQUFFLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFDeEIsRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUMzQyxFQUFFLEdBQUcsRUFBRSxHQUFHLEdBQUcsQ0FBQztnQkFDZCxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQ2hCLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQzthQUNwQjtZQUNELEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNuRixFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbEYsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDWCxHQUFHLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUN4QixFQUFFLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUN4QixFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNuRCxFQUFFLEdBQUcsRUFBRSxHQUFHLEdBQUcsQ0FBQztZQUNkLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUNoQixDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDakIsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ25GLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNsRixFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNYLEdBQUcsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO1lBQ3hCLEVBQUUsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ3hCLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ25ELEVBQUUsR0FBRyxFQUFFLEdBQUcsR0FBRyxDQUFDO1lBQ2QsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ2hCLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUNqQixFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDbkYsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2xGLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ1gsR0FBRyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7WUFDeEIsRUFBRSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDeEIsRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDbkQsRUFBRSxHQUFHLEVBQUUsR0FBRyxHQUFHLENBQUM7WUFDZCxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDaEIsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO1NBQ3BCO1FBRUQsSUFBSSxDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzFCLElBQUksQ0FBQyxHQUFHLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMxQixJQUFJLENBQUMsR0FBRyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDMUIsSUFBSSxDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzFCLElBQUksQ0FBQyxHQUFHLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMxQixJQUFJLENBQUMsR0FBRyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDMUIsSUFBSSxDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzFCLElBQUksQ0FBQyxHQUFHLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUM5QixDQUFDOztBQXpiTCx3QkEwYkM7QUF6Ykc7O0dBRUc7QUFDb0IsZUFBUSxHQUFXLEdBQUcsQ0FBQztBQUU5Qzs7R0FFRztBQUNvQixlQUFRLEdBQVcsR0FBRyxDQUFDO0FBRTlDOzs7R0FHRztBQUNxQixZQUFLLEdBQWEsQ0FBQyxDQUFDLFVBQVUsRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBRTdFOzs7R0FHRztBQUNxQixZQUFLLEdBQWEsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUV6RDs7O0dBR0c7QUFDcUIsUUFBQyxHQUFnQixXQUFXLENBQUMsSUFBSSxDQUFDO0lBQ3RELFVBQVUsRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxVQUFVO0lBQzlGLFVBQVUsRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxVQUFVO0lBQzlGLFVBQVUsRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxVQUFVO0lBQzlGLFVBQVUsRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxVQUFVO0lBQzlGLFVBQVUsRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxVQUFVO0lBQzlGLFVBQVUsRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxVQUFVO0lBQzlGLFVBQVUsRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxVQUFVO0lBQzlGLFVBQVUsRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxVQUFVO0NBQ2pHLENBQUMsQ0FBQyJ9
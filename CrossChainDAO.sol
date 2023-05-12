import "./btcrelay-sol/BTCRelay_commit_pruned_tsfix.sol";

contract CrossChainDAO {

    struct TransactionProof {
        uint256 blockheight;
        uint256 txPos;
        bytes merkleProof;
        BTCRelay.HeaderInfo committedHeader;
    }

    struct UtxoStateTransitionOutput {
        bytes32 utxoHash; //if <0xFFFF then is treated as vout of the current commitment transaction else hash of reversedTxId + vout
        uint256 balance; //Balance of tokens held at the UTXO
        uint256 timelock; //Timelock of the UTXO, 0 if no timelock
        bytes32 publicKeyX; //x point of the public key
        bytes32 publicKeyY; //y point of the public key
    }

    struct UtxoState {
        uint256 balance; //Balance of tokens held at the UTXO
        uint256 timelock; //Timelock of the UTXO, 0 if no timelock
        bytes32 publicKeyX; //x point of the public key
        bytes32 publicKeyY; //y point of the public key
    }

    struct GenesisUtxoState {
        uint256 vin;
        
        uint256 balance; //Balance of tokens held at the UTXO
        uint256 timelock; //Timelock of the UTXO, 0 if no timelock
        bytes32 publicKeyX; //x point of the public key
        bytes32 publicKeyY; //y point of the public key

        uint256 position;
        bytes merkleProof;
    }

    bytes32 public _genesisMerkleRoot;
    mapping(uint256 => uint256) public _genesisSpent;

    mapping(bytes32 => bytes32) public _data; //addr: address, timelock: uint32, balance: uint64

    event UtxoSpent(bytes32 indexed utxoHash, bytes32 data);
    event UtxoCreated(bytes32 indexed utxoHash, bytes32 data);

    //BTCRelay immutable _btcRelay;

    // constructor(bytes32 genesisMerkleRoot) {
    //     _genesisMerkleRoot = genesisMerkleRoot;
    //     //_btcRelay = btcRelay;
    // }

    function transactGenesis(
        bytes memory transactionData,
        GenesisUtxoState[] calldata ins,
        UtxoStateTransitionOutput[] memory outs,
        bytes calldata outPublicKeys
    ) public {

        (
            bytes32 reversedTxId,
            bytes32 opReturnCommitHash,
            bytes32[] memory vinUtxoHashes,
            bytes32[] memory outputScriptHashes
        ) = getTransactionData(transactionData);

        require(opReturnCommitHash==getStateTransitionCommitHash(outs), "Invalid commit hash in tx");

        //Check inputs
        uint256 totalInput;
        for(uint i;i<ins.length;i++) {
            {
                bytes32 genesisHash = getGenesisHash(vinUtxoHashes[ins[i].vin], ins[i]);
                bytes32 expectedMerkleRoot = computeMerkle_calldata(genesisHash, ins[i].position, ins[i].merkleProof);
                require(expectedMerkleRoot==_genesisMerkleRoot, "Invalid merkle!");
            }

            uint256 index = ins[i].position >> 8;
            uint256 data = _genesisSpent[index];
            uint256 remainder = ins[i].position & 0xFF;
            require((data >> remainder) == 0, "Already claimed");
            
            //Mark as already spent
            _genesisSpent[index] = data | (0x1 << remainder);

            totalInput += ins[i].balance;
        }

        _transact(totalInput, reversedTxId, outs, outPublicKeys, outputScriptHashes);

    }

    function getGenesisHash(bytes32 utxoHash, GenesisUtxoState calldata utxoState) public view returns (bytes32 result) {
        assembly {
            let freeMemory := mload(0x40)
            mstore(0x40, add(freeMemory, 128))
            mstore(0x00, utxoHash)
            calldatacopy(freeMemory, add(utxoState, 32), 128)

            pop(staticcall(gas(), 0x02, freeMemory, 128, 0x20, 32))
            pop(staticcall(gas(), 0x02, 0x00, 64, 0x00, 32))

            result := mload(0x00)
        }
    }

    function computeMerkle_calldata(bytes32 hash, uint256 position, bytes calldata merkleProof) private view returns(bytes32 value) {
        //  Special case: only coinbase tx in block. Root == proof
        if(merkleProof.length == 0) return hash;

        assembly {
            let len := sub(merkleProof.length, 32)
            //let len := mul(sub(mload(reversedMerkleProof), 1), 32)
            let dataElementLocation := merkleProof.offset

            mstore(mul(and(position, 0x1), 0x20), hash)
            //pop(staticcall(gas(), 0x02, 0x00, 0x40, 0x00, 32))
            //pop(staticcall(gas(), 0x02, 0x00, 0x20, result, 32))

            for
                { let end := add(dataElementLocation, len) }
                lt(dataElementLocation, end)
                { dataElementLocation := add(dataElementLocation, 32) }
            {
                //mstore(mul(and(not(txIndex), 0x1), 0x20), mload(dataElementLocation))
                calldatacopy(mul(and(not(position), 0x1), 0x20), dataElementLocation, 0x20)

                position := shr(1, position)
                pop(staticcall(gas(), 0x02, 0x00, 0x40, mul(and(position, 0x1), 0x20), 32)) //goes to first position if txIndex & 1 == 1 else second position
            }

            //mstore(mul(and(not(txIndex), 0x1), 0x20), mload(dataElementLocation))
            calldatacopy(mul(and(not(position), 0x1), 0x20), dataElementLocation, 0x20)

            pop(staticcall(gas(), 0x02, 0x00, 0x40, 0x00, 32)) //first hash

            value := mload(0x00)
        }
    }

    function saveCommitment(
        bytes32 utxoHash,
        UtxoState memory utxoState
    ) public {
        bytes32 saveData = bytes32(
            (utxoState.balance & 0xFFFFFFFFFFFFFFFF)<<192 |
            (utxoState.timelock & 0xFFFFFFFF)<<160 | 
            uint256(uint160(getEthAddress(utxoState.publicKeyX, utxoState.publicKeyY)))
        );
        _data[utxoHash] = saveData;
        emit UtxoCreated(utxoHash, saveData);
    }

    function transact(
        bytes memory transactionData,
        uint256[] calldata ins,
        UtxoStateTransitionOutput[] memory outs,
        bytes calldata outPublicKeys
    ) public {

        (
            bytes32 reversedTxId,
            bytes32 opReturnCommitHash,
            bytes32[] memory vinUtxoHashes,
            bytes32[] memory outputScriptHashes
        ) = getTransactionData(transactionData);

        require(opReturnCommitHash==getStateTransitionCommitHash(outs), "Invalid commit hash in tx");

        //Check inputs
        uint256 totalInput;
        for(uint i;i<ins.length;i++) {
            bytes32 vinUtxoHash = vinUtxoHashes[ins[i]];

            uint256 data = uint256(_data[vinUtxoHash]);
            totalInput += data>>192;

            emit UtxoSpent(vinUtxoHash, bytes32(data));
            _data[vinUtxoHash] = 0x00;
        }

        _transact(totalInput, reversedTxId, outs, outPublicKeys, outputScriptHashes);

    }


    function _transact(
        uint256 totalInput,
        bytes32 reversedTxId,
        UtxoStateTransitionOutput[] memory outs,
        bytes calldata outPublicKeys,
        bytes32[] memory outputScriptHashes
    ) private {

        //Check outputs
        uint256 outPublicKeysIndex;
        for(uint i;i<outs.length;i++) {
            UtxoStateTransitionOutput memory outputStateTransitions = outs[i];
            
            {
                uint256 stateBalance = outputStateTransitions.balance;
                require(totalInput >= stateBalance, "Invalid amounts");
                totalInput -= stateBalance;
            }

            bytes32 utxoHash = outputStateTransitions.utxoHash;
            
            if(uint256(utxoHash)<0xFFFF) {
                //Newly created UTXO
                bytes32 p2wsh = outputScriptHashes[uint256(utxoHash)];
                utxoHash = getUtxoHash(reversedTxId, uint256(utxoHash));
                
                uint256 timelock = outputStateTransitions.timelock;
                //Here it is also possible to lock the tokens
                if(timelock>0) {
                    //Check locking script
                    assembly {
                        mstore(0, or(
                            0x0400000000b175210000,
                            shl(
                                40,
                                and(timelock, 0xFFFFFFFF)
                            )
                        ))
                        mstore(32, 0xad) //OP_CHECKSIGVERIFY
                        calldatacopy(30, add(outPublicKeys.offset, outPublicKeysIndex), 33)

                        pop(staticcall(gas(), 0x02, 22, 42, 0x00, 32))
                        p2wsh := eq(p2wsh, mload(0x00))

                    }
                    require(p2wsh==bytes32(uint256(0x01)), "Invalid locking script");
                    outPublicKeysIndex += 33;
                }
            } else {
                require(outputStateTransitions.timelock==0, "Cannot specify timelock");
                require(outputStateTransitions.publicKeyX==0, "Cannot specify public key");
                require(outputStateTransitions.publicKeyY==0, "Cannot specify public key");

                //Check the current state of the UTXO
                outputStateTransitions.balance += uint256(_data[utxoHash])>>192;
            }

            bytes32 saveData = bytes32(
                (outputStateTransitions.balance & 0xFFFFFFFFFFFFFFFF)<<192 |
                (outputStateTransitions.timelock & 0xFFFFFFFF)<<160 | 
                uint256(uint160(getEthAddress(outputStateTransitions.publicKeyX, outputStateTransitions.publicKeyY)))
            );
            emit UtxoCreated(utxoHash, saveData);
            _data[utxoHash] = saveData;
        }

    }

    function getEthAddress(bytes32 xVotingKey, bytes32 yVotingKey) public pure returns (address result) {
        assembly {
            mstore(0x00, xVotingKey)
            mstore(0x20, yVotingKey)
            result := keccak256(0x00, 0x40)
        }
    }

    function getVotingPower(address voter, bytes32 utxoHash, uint256 minExpiry) public view returns (uint256 votingPower) {
        //Check if commited
        uint256 data = uint256(_data[utxoHash]);
        uint256 timelock = (data >> 160) & 0xFFFFFFFF;
        uint256 balance = data >> 192;
        require(timelock>=minExpiry, "Not timelocked for enough");
        require(voter==address(uint160(data)), "Invalid voter address");

        votingPower = 1+((timelock - block.timestamp) / 360 days);
        if(votingPower>5) votingPower = 5;
        votingPower *= balance;
    }

    function getStateTransitionCommitHash(UtxoStateTransitionOutput[] memory newStates) public view returns (bytes32 result) {
        assembly {
            let len := mload(newStates)
            let limit := add(newStates, mul(32, add(1, len)))
            
            let start := mload(0x40)
            mstore(0x40, add(start, mul(32, len)))
            let dst := start

            for
                { let index := add(newStates, 32) }
                lt(index, limit)
                { index := add(index, 32) }
            {
                let startPosition := mload(index)
                pop(staticcall(gas(), 0x02, startPosition, 160, dst, 32))
                dst := add(dst, 32)
            }
            
            pop(staticcall(gas(), 0x02, start, mul(32, len), 0x00, 32))

            result := mload(0x00)
        }
    }

    function getUtxoHash(bytes32 reversedTxId, uint256 vout) public view returns (bytes32 result) {
        assembly {
            mstore(0x00, reversedTxId)
            mstore(0x20, vout)
            pop(staticcall(gas(), 0x02, 0x00, 0x40, 0x00, 32))
            result := mload(0x00)
        }
    }

    function getTransactionData(bytes memory txData) public view returns (
        bytes32 reversedTxId,
        bytes32 opReturnCommitHash,
        bytes32[] memory vinUtxoHashes,
        bytes32[] memory outputScriptHashes
    ) {
        assembly {

            function uint32LEtoBE(input) -> output {
                output := or(shr(8, and(input, 0xFF00FF00)), shl(8, and(input, 0x00FF00FF)))
                output := or(shr(16, and(output, 0xFFFF0000)), shl(16, and(output, 0x0000FFFF)))
            }

            function readVarInt(inputBytes) -> inputCount, inputByteCount {
                inputByteCount := 1

                switch gt(shr(248,inputBytes), 0xFC) case 1 {
                    inputByteCount := shl(sub(shr(248,inputBytes), 0xFC), 0x01)
                    for
                        { let index := 0 }
                        lt(index, inputByteCount)
                        { index := add(index, 1) }
                    {
                        inputCount := shl(8, inputCount)
                        inputCount := or(
                            inputCount,
                            and(shr(sub(240, mul(index, 8)), inputBytes), 0xFF)
                        )
                    }
                    inputByteCount := add(inputByteCount, 1)
                } default {
                    inputCount := and(shr(248,inputBytes), 0xFF)
                }
            }

            //32 byte length prefix + 4 bytes of version
            let offset := add(txData,36)

            let inputCount, inputByteCount := readVarInt(mload(offset))
            offset := add(offset, inputByteCount)

            vinUtxoHashes := mload(0x40)
            mstore(vinUtxoHashes, inputCount)

            inputCount := add(32, mul(inputCount, 32))

            mstore(0x40, add(vinUtxoHashes, inputCount))

            for
                { let index := 32 }
                lt(index, inputCount)
                { index := add(index, 32) }
            {
                mstore(0x00, mload(offset))
                mstore(0x20, uint32LEtoBE(
                    shr(
                        224,
                        mload(
                            add(offset,32)
                        )
                    )
                ))
                pop(staticcall(gas(), 0x02, 0x00, 0x40, 0x00, 32))
                mstore(
                    add(vinUtxoHashes, index),
                    mload(0x00)
                )

                offset := add(offset, 36) //Utxo and index

                let scriptLen, scripLenSize := readVarInt(mload(offset))

                offset := add(offset, add(scripLenSize, scriptLen))
                offset := add(offset, 4)
            }

            let outputCount, outputByteCount := readVarInt(mload(offset))

            offset := add(offset, outputByteCount)

            outputScriptHashes := mload(0x40)
            mstore(outputScriptHashes, outputCount)

            outputCount := add(32, mul(outputCount, 32))
            mstore(0x40, add(outputScriptHashes, outputCount))

            for
                { let index := 32 }
                lt(index, outputCount)
                { index := add(index, 32) }
            {
                let amount := shr(192, mload(offset))

                offset := add(offset, 8)

                let scriptLen, scripLenSize := readVarInt(mload(offset))

                offset := add(offset, scripLenSize)

                switch shr(240,mload(offset)) case 0x0020 {
                    mstore(
                        add(outputScriptHashes, index),
                        mload(add(offset, 2))
                    )
                } case 0x6a20 {
                    opReturnCommitHash := mload(add(offset, 2))
                }

                offset := add(offset, scriptLen)
            }
            
            let length := mload(txData)

            pop(staticcall(gas(), 0x02, add(txData, 32), length, 0x00, 32)) //first hash
            pop(staticcall(gas(), 0x02, 0x00, 0x20, 0x00, 32))

            reversedTxId := mload(0x00)
        }
    }

}
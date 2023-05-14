import { ProposalStateEnum } from "@/enum/ProposalStateEnum";

export class ProposalDTO {
    id: number;
    createdAt: number;
    target: string;
    callData: string;
    name: string;
    description: string;
    expiry: number;
    author: string;
    voteYes: number;
    percentYes: number;
    voteNo: number;
    percentNo: number;
    totalVotes: number;
    quorumPercent: number;
    eligibleVotes: number;
    state: ProposalStateEnum;
    alreadyVoted: boolean;
  
    constructor(
        id: number,
        createdAt: number,
        target: string,
        callData: string,
        name: string,
        description: string,
        expiry: number,
        author: string,
        voteYes: number,
        percentYes: number,
        voteNo: number,
        percentNo: number,
        totalVotes: number,
        quorumPercent: number,
        eligibleVotes: number,
        state: ProposalStateEnum,
        alreadyVoted: boolean
    ) {
        this.id = id;
        this.createdAt = createdAt;
        this.target = target;
        this.callData = callData;
        this.name = name;
        this.description = description;
        this.expiry = expiry;
        this.author = author;
        this.voteYes = voteYes;
        this.percentYes = percentYes;
        this.voteNo = voteNo;
        this.percentNo = percentNo;
        this.totalVotes = totalVotes;
        this.quorumPercent = quorumPercent;
        this.eligibleVotes = eligibleVotes;
        this.state = state;
        this.alreadyVoted = alreadyVoted;
    }
  }
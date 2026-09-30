/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface EvidenceSource {
  id: string;
  type: 'commit' | 'pull_request' | 'issue' | 'design_doc' | 'discussion';
  title: string;
  reference: string;
  date: string;
  author: string;
  snippet: string;
  url?: string;
}

export interface DecisionRecord {
  id: string;
  topic: string;
  question: string;
  decisionMade: string;
  whyMade: string;
  alternativesConsidered: {
    name: string;
    description: string;
    whyRejected: string;
  }[];
  supportingEvidence: EvidenceSource[];
  invariantsProtected: string[];
  impactArea: string;
  status: 'ACTIVE' | 'SUPERSEDED' | 'PROPOSED';
  timestamp: string;
}

export interface DecisionMemoryQueryResponse {
  query: string;
  matchedDecisions: DecisionRecord[];
  summaryExplanation: string;
  keyTakeaway: string;
  retrievedEvidenceCount: number;
}

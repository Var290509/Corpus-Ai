import { ResearchPaper, QueryVersion, ReviewerDecision, DiffReport, AuditRunLog } from '../types';
import { runDeduplication } from './deduplication';

export class Level2LoopManager {
  /**
   * Generates a diff report comparing two query versions
   */
  public static computeVersionDiff(
    allPapers: ResearchPaper[],
    fromVersionId: string,
    toVersionId: string,
    fromVersionNum: number,
    toVersionNum: number,
    existingDecisions: Record<string, ReviewerDecision>
  ): DiffReport {
    const papersInFrom = allPapers.filter(p => p.queryVersionIds.includes(fromVersionId));
    const papersInTo = allPapers.filter(p => p.queryVersionIds.includes(toVersionId));

    const fromIds = new Set(papersInFrom.map(p => p.id));
    const toIds = new Set(papersInTo.map(p => p.id));

    const addedPaperIds = [...toIds].filter(id => !fromIds.has(id));
    const removedPaperIds = [...fromIds].filter(id => !toIds.has(id));

    // Check merged groups
    const groupMemberMap = new Map<string, string[]>();
    allPapers.forEach(p => {
      if (!groupMemberMap.has(p.groupId)) groupMemberMap.set(p.groupId, []);
      groupMemberMap.get(p.groupId)!.push(p.id);
    });

    const mergedGroups: DiffReport['mergedGroups'] = [];
    groupMemberMap.forEach((members, groupId) => {
      if (members.length > 1) {
        // Check if members come from different versions
        const decisions = members.map(id => existingDecisions[id]?.status).filter(Boolean);
        const uniqueDecisions = new Set(decisions.filter(s => s !== 'unscreened'));
        const hasConflict = uniqueDecisions.size > 1;

        mergedGroups.push({
          groupId,
          previousGroupIds: [groupId],
          memberCount: members.length,
          hasDecisionConflict: hasConflict
        });
      }
    });

    return {
      id: `diff-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      fromVersion: fromVersionNum,
      toVersion: toVersionNum,
      addedPapersCount: addedPaperIds.length,
      removedPapersCount: removedPaperIds.length,
      newlyMergedGroupsCount: mergedGroups.length,
      addedPaperIds,
      removedPaperIds,
      mergedGroups
    };
  }

  /**
   * Filters the active record set to reproduce exactly a target historical version
   */
  public static revertToVersion(
    allPapers: ResearchPaper[],
    targetVersionId: string
  ): ResearchPaper[] {
    return allPapers.map(paper => {
      const belongsToVersion = paper.queryVersionIds.includes(targetVersionId);
      return {
        ...paper,
        hidden: !belongsToVersion || (!paper.isRepresentative)
      };
    });
  }

  /**
   * Log an audit trail entry
   */
  public static createAuditLog(
    versionNumber: number,
    step: AuditRunLog['step'],
    action: string,
    actor: 'human' | 'system',
    details: string
  ): AuditRunLog {
    return {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      versionNumber,
      step,
      action,
      actor,
      details
    };
  }
}

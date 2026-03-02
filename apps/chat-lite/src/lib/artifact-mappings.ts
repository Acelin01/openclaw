/**
 * Artifact 映射配置
 */

export interface ArtifactMapping {
  skillName: string;
  artifactKind: string;
  documentType: string;
  previewEnabled: boolean;
  previewIcon: string;
  previewLabel: string;
}

export const ARTIFACT_MAPPINGS: Record<string, ArtifactMapping> = {
  'testcase_create': {
    skillName: 'testcase_create',
    artifactKind: 'testcase',
    documentType: 'testcase',
    previewEnabled: true,
    previewIcon: '📱',
    previewLabel: '预览测试用例'
  },
  'project_create': {
    skillName: 'project_create',
    artifactKind: 'project-requirement',
    documentType: 'project',
    previewEnabled: true,
    previewIcon: '📋',
    previewLabel: '预览项目'
  },
  'requirement_create': {
    skillName: 'requirement_create',
    artifactKind: 'project-requirement',
    documentType: 'requirement',
    previewEnabled: true,
    previewIcon: '📝',
    previewLabel: '预览需求'
  },
  'milestone_create': {
    skillName: 'milestone_create',
    artifactKind: 'milestone-create',
    documentType: 'milestone',
    previewEnabled: true,
    previewIcon: '🚩',
    previewLabel: '新建里程碑'
  },
  'milestone_list': {
    skillName: 'milestone_list',
    artifactKind: 'milestone-list',
    documentType: 'milestone',
    previewEnabled: true,
    previewIcon: '🚩',
    previewLabel: '里程碑列表'
  },
  'milestone_get': {
    skillName: 'milestone_get',
    artifactKind: 'milestone-detail',
    documentType: 'milestone',
    previewEnabled: true,
    previewIcon: '🚩',
    previewLabel: '里程碑详情'
  }
};

export function getArtifactMapping(skillName: string): ArtifactMapping | null {
  return ARTIFACT_MAPPINGS[skillName] || null;
}

export function isPreviewSupported(skillName: string): boolean {
  const mapping = ARTIFACT_MAPPINGS[skillName];
  return mapping?.previewEnabled === true;
}

export function generatePreviewLink(baseUrl: string, artifactKind: string, documentId: string): string {
  return `${baseUrl}/preview/${artifactKind}?id=${documentId}`;
}

import assetIcon from "../../assets/asset.png";
import componentIcon from "../../assets/component.png";
import locationIcon from "../../assets/location.png";
import type { TreeNode } from "../../types";
import type { TreeTagTone } from "../../components/_ui/TreeTag";

export interface TreeTagDescriptor {
  key: string;
  tone: TreeTagTone;
  label: string;
}

export interface TreeMetadataEntry {
  key: string;
  label: string;
  value: string;
}

export interface TreeNodePresentation {
  icon: {
    src: string;
    alt: string;
  };
  subtitle: string;
  tags: TreeTagDescriptor[];
  metadata: TreeMetadataEntry[];
  statusTag?: TreeTagDescriptor;
  highlightClass?: string;
}

const iconByType = {
  location: locationIcon,
  asset: assetIcon,
  component: componentIcon,
} as const;

const typeLabelByType: Record<TreeNode["type"], string> = {
  location: "Localização",
  asset: "Ativo",
  component: "Componente",
};

const sensorTone: Record<"energy" | "vibration", TreeTagTone> = {
  energy: "info",
  vibration: "warning",
};

const statusTone: Record<"operating" | "alert", TreeTagTone> = {
  operating: "positive",
  alert: "critical",
};

type CountTagConfig = {
  key: string;
  tone: TreeTagTone;
  label: (count: number) => string;
};

const compact = <T>(values: Array<T | null | undefined | false>): T[] =>
  values.filter(Boolean) as T[];

const locationChildTagConfig: Partial<
  Record<TreeNode["type"], CountTagConfig>
> = {
  location: {
    key: "tags-locations",
    tone: "neutral",
    label: (count) => `${count} sublocalizações`,
  },
  asset: {
    key: "tags-assets",
    tone: "info",
    label: (count) => `${count} ativos`,
  },
  component: {
    key: "tags-components",
    tone: "warning",
    label: (count) => `${count} componentes`,
  },
};

const assetChildTagConfig: Partial<Record<TreeNode["type"], CountTagConfig>> = {
  asset: {
    key: "tags-subassets",
    tone: "neutral",
    label: (count) => `${count} subativos`,
  },
  component: {
    key: "tags-components",
    tone: "info",
    label: (count) => `${count} sensores`,
  },
};

function buildCountTags(
  counts: Record<TreeNode["type"], number>,
  config: Partial<Record<TreeNode["type"], CountTagConfig>>,
): TreeTagDescriptor[] {
  return (
    Object.entries(config) as Array<[TreeNode["type"], CountTagConfig]>
  ).reduce<TreeTagDescriptor[]>((acc, [type, { key, tone, label }]) => {
    const count = counts[type];
    if (count > 0) {
      acc.push({
        key,
        tone,
        label: label(count),
      });
    }
    return acc;
  }, []);
}

function countChildrenByType(node: TreeNode) {
  return node.children.reduce(
    (acc, child) => {
      acc[child.type] += 1;
      return acc;
    },
    { location: 0, asset: 0, component: 0 } as Record<TreeNode["type"], number>,
  );
}

export function describeTreeNode(node: TreeNode): TreeNodePresentation {
  const subtitle = typeLabelByType[node.type];
  const basePresentation: TreeNodePresentation = {
    icon: {
      src: iconByType[node.type],
      alt: `${subtitle} ${node.name}`,
    },
    subtitle,
    tags: [],
    metadata: [],
  };

  if (node.type === "location") {
    const childCounts = countChildrenByType(node);

    return {
      ...basePresentation,
      tags: buildCountTags(childCounts, locationChildTagConfig),
    };
  }

  if (node.type === "asset") {
    const childCounts = countChildrenByType(node);
    const unlinkedTag: TreeTagDescriptor | null =
      !node.data.locationId && !node.data.parentId
        ? {
            key: "tags-unlinked",
            tone: "warning",
            label: "sem vínculo",
          }
        : null;

    const tags = compact<TreeTagDescriptor>([
      ...buildCountTags(childCounts, assetChildTagConfig),
      unlinkedTag,
    ]);

    const metadata = compact([
      {
        key: "metadata-id",
        label: "ID",
        value: node.data.id,
      },
      node.data.locationId
        ? {
            key: "metadata-location",
            label: "Localização",
            value: node.data.locationId,
          }
        : null,
      node.data.parentId
        ? {
            key: "metadata-parent",
            label: "Ativo pai",
            value: node.data.parentId,
          }
        : null,
    ]);

    return {
      ...basePresentation,
      tags,
      metadata,
    };
  }

  const tags: TreeTagDescriptor[] = [
    {
      key: "tags-sensor-type",
      tone: sensorTone[node.data.sensorType],
      label: `Sensor ${node.data.sensorType === "energy" ? "de energia" : "de vibração"}`,
    },
  ];

  const metadata = compact([
    {
      key: "metadata-sensor",
      label: "Sensor",
      value: node.data.sensorId,
    },
    node.data.gatewayId
      ? {
          key: "metadata-gateway",
          label: "Gateway",
          value: node.data.gatewayId,
        }
      : null,
    node.data.parentId
      ? {
          key: "metadata-parent",
          label: "Ativo pai",
          value: node.data.parentId,
        }
      : null,
    node.data.locationId
      ? {
          key: "metadata-location",
          label: "Localização",
          value: node.data.locationId,
        }
      : null,
  ]);

  const statusTag: TreeTagDescriptor = {
    key: "status",
    tone: statusTone[node.data.status],
    label: node.data.status === "alert" ? "Alerta" : "Operando",
  };

  const highlightClass =
    node.data.status === "alert"
      ? "border-critical-500/60 shadow-[0_0_0_1px_rgba(244,63,94,0.35)]"
      : undefined;

  return {
    ...basePresentation,
    tags,
    metadata,
    statusTag,
    highlightClass,
  };
}

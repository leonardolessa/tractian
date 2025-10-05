import type { Location } from "./location";
import type { ComponentAsset, NonComponentAsset } from "./asset";

export type TreeNodeType = "location" | "asset" | "component";

interface TreeNodeBase<TData, TType extends TreeNodeType> {
  id: string;
  name: string;
  type: TType;
  data: TData;
  children: TreeNode[];
}

export type LocationTreeNode = TreeNodeBase<Location, "location">;

export type AssetTreeNode = TreeNodeBase<NonComponentAsset, "asset">;

export type ComponentTreeNode = TreeNodeBase<ComponentAsset, "component">;

export type TreeNode = LocationTreeNode | AssetTreeNode | ComponentTreeNode;

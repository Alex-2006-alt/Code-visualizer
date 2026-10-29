class TreeNode:
    def __init__(self, val, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

root = TreeNode(4, TreeNode(2, TreeNode(1), TreeNode(3)), TreeNode(5))
out = []
def inorder(node):
    if node:
        inorder(node.left)
        out.append(node.val)
        inorder(node.right)

inorder(root)
print("Inorder:", out)

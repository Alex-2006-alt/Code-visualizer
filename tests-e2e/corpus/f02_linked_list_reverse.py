class Node:
    def __init__(self, val, nxt=None):
        self.val = val
        self.next = nxt

head = Node(1, Node(2, Node(3, None)))
prev = None
curr = head
while curr:
    nxt = curr.next
    curr.next = prev
    prev = curr
    curr = nxt

vals = []
while prev:
    vals.append(prev.val)
    prev = prev.next
print("Reversed list:", vals)

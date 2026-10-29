import collections
q = collections.deque()
q.append(1)
q.append(2)
q.append(3)
first = q.popleft()
print("first dequeued:", first, "remaining:", list(q))

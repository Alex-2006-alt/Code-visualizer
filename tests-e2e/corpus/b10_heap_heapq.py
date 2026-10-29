import heapq
heap = []
for n in [34, 12, 5, 89, 1]:
    heapq.heappush(heap, n)
smallest = heapq.heappop(heap)
second = heapq.heappop(heap)
print("smallest:", smallest, "second:", second)

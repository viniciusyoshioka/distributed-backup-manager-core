
interface QueueItem<T = unknown> {
  next: QueueItem<T> | null
  value: T
}


export class Queue<T = unknown> {


  private firstItem: QueueItem<T> | null = null
  private lastItem: QueueItem<T> | null = null
  private queueSize = 0


  constructor(...items: T[]) {
    if (!items.length) {
      return
    }
    items.forEach(item => this.enqueue(item))
  }


  get size(): number {
    return this.queueSize
  }


  enqueue(item: T) {
    const newItem: QueueItem<T> = {
      next: null,
      value: item,
    }

    if (this.queueSize === 0) {
      this.firstItem = newItem
      this.lastItem = newItem
      this.queueSize++
      return
    }

    if (!this.firstItem) {
      throw new Error("Queue.firstItem is null when it shouldn't be, cannot add new item to queue")
    }
    if (!this.lastItem) {
      throw new Error("Queue.lastItem is null when it shouldn't be, cannot add new item to queue")
    }

    if (this.queueSize === 1) {
      this.firstItem.next = newItem
      this.lastItem = newItem
      this.queueSize++
      return
    }

    this.lastItem.next = newItem
    this.lastItem = newItem
    this.queueSize++
  }

  dequeue(): T {
    if (this.isEmpty()) {
      throw new Error('Queue is empty, cannot dequeue a item')
    }

    const dequeuedItem = this.firstItem
    if (!dequeuedItem) {
      throw new Error("Queue.firstItem is null when it shouldn't be, cannot dequeue item")
    }

    if (this.queueSize === 1) {
      this.firstItem = null
      this.lastItem = null
      this.queueSize--
      return dequeuedItem.value
    }

    if (this.queueSize === 2) {
      this.firstItem = dequeuedItem.next
      this.lastItem = dequeuedItem.next
      this.queueSize--
      return dequeuedItem.value
    }

    this.firstItem = dequeuedItem.next
    this.queueSize--
    return dequeuedItem.value
  }

  clear() {
    this.firstItem = null
    this.lastItem = null
    this.queueSize = 0
  }

  isEmpty(): boolean {
    return this.size === 0
  }
}

import { Queue } from '@utils'


describe('Test Queue', () => {
  describe('Basic queue behavior', () => {
    const queue = new Queue<number>()

    it('should be empty right after instantiation', () => {
      expect(queue.size).toBe(0)
      expect(queue.isEmpty()).toBe(true)
    })

    it('should throw when trying to dequeue an empty queue', () => {
      expect(() => queue.dequeue()).toThrow('Queue is empty, cannot dequeue a item')
    })

    it('should not throw when clearing an empty queue', () => {
      expect(() => queue.clear()).not.toThrow()
    })

    it('should still be empty after clearing', () => {
      expect(queue.size).toBe(0)
      expect(queue.isEmpty()).toBe(true)
    })

    it('should not throw when an item is enqueued', () => {
      expect(() => queue.enqueue(1)).not.toThrow()
    })

    it('should have size 1 after enqueuing one item', () => {
      expect(queue.size).toBe(1)
      expect(queue.isEmpty()).toBe(false)
    })

    it('should return the item when dequeued', () => {
      const item = queue.dequeue()
      expect(item).toBe(1)
    })

    it('should be empty after dequeuing the only item', () => {
      expect(queue.size).toBe(0)
      expect(queue.isEmpty()).toBe(true)
    })
  })


  describe('Ensure multiple items are enqueued correctly', () => {
    const queue = new Queue<number>()

    it('should enqueue many numbers from 1 to 20', () => {
      for (let i = 1; i <= 20; i++) {
        queue.enqueue(i)
      }

      expect(queue.size).toBe(20)
      expect(queue.isEmpty()).toBe(false)
    })

    it('should dequeue all 20 items in the correct order', () => {
      for (let i = 1; i <= 20; i++) {
        const item = queue.dequeue()
        expect(item).toBe(i)
      }

      expect(queue.size).toBe(0)
      expect(queue.isEmpty()).toBe(true)
    })

    it('should enqueue many numbers from 20 to 10', () => {
      for (let i = 20; i >= 10; i--) {
        queue.enqueue(i)
      }

      expect(queue.size).toBe(11)
      expect(queue.isEmpty()).toBe(false)
    })

    it('should dequeue all 10 items in the correct order', () => {
      for (let i = 20; i >= 10; i--) {
        const item = queue.dequeue()
        expect(item).toBe(i)
      }

      expect(queue.size).toBe(0)
      expect(queue.isEmpty()).toBe(true)
    })
  })


  describe('Enqueue items on instantiation', () => {
    const items = [1, 2, 3, 4, 5]
    const queue = new Queue<number>(...items)

    it('should have size 5 after instantiation with items', () => {
      expect(queue.size).toBe(5)
      expect(queue.isEmpty()).toBe(false)
    })

    it('should dequeue all 5 items in the correct order', () => {
      for (let i = 1; i <= 5; i++) {
        const item = queue.dequeue()
        expect(item).toBe(i)
      }

      expect(queue.size).toBe(0)
      expect(queue.isEmpty()).toBe(true)
    })
  })
})

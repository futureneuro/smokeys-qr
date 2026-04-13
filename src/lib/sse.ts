export type SSEController = ReadableStreamDefaultController<string>

export interface SSEEvent {
  event: string
  data: unknown
}

class SSEManager {
  private clients: Map<string, Set<SSEController>> = new Map()

  addClient(restaurantId: string, controller: SSEController): void {
    if (!this.clients.has(restaurantId)) {
      this.clients.set(restaurantId, new Set())
    }
    this.clients.get(restaurantId)!.add(controller)
  }

  removeClient(restaurantId: string, controller: SSEController): void {
    const set = this.clients.get(restaurantId)
    if (set) {
      set.delete(controller)
      if (set.size === 0) {
        this.clients.delete(restaurantId)
      }
    }
  }

  broadcast(restaurantId: string, event: string, data: unknown): void {
    const clients = this.clients.get(restaurantId)
    if (!clients) return

    const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`

    clients.forEach((controller) => {
      try {
        controller.enqueue(message)
      } catch (error) {
        // Client disconnected, remove it
        this.removeClient(restaurantId, controller)
      }
    })
  }
}

export const sseManager = new SSEManager()

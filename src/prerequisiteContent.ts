// Static reference content for the "LLD Prerequisites" / "HLD Prerequisites"
// topics seeded once into System Design. Each section becomes one subtopic
// (checkable on its own), and its items are transcribed into the topic's
// notes in the same order, under a matching heading.

export interface PrereqSection {
  heading: string
  items?: string[]
  groups?: { label: string; items: string[] }[]
}

export const LLD_PREREQUISITES: PrereqSection[] = [
  {
    heading: '1. Core OOP',
    items: [
      'Encapsulation, abstraction, inheritance, polymorphism (compile-time/overloading and runtime/overriding)',
      'Class vs object, constructors, constructor chaining, this and super',
      'Interfaces vs abstract classes, default and static interface methods',
      'Composition vs inheritance, aggregation vs association vs composition',
      'Coupling and cohesion',
      'equals()/hashCode() contract, toString(), clone()',
      'static vs instance members, static/instance initializer blocks',
      'Access modifiers: private, default (package-private), protected, public',
      'final on classes, methods, variables',
      'Object class methods and immutability',
    ],
  },
  {
    heading: '2. SOLID Principles (all five)',
    items: [
      'S — Single Responsibility Principle: a class has one reason to change',
      'O — Open/Closed Principle: open for extension, closed for modification',
      'L — Liskov Substitution Principle: subtypes must be substitutable for base types without breaking correctness',
      'I — Interface Segregation Principle: many client-specific interfaces beat one fat interface',
      'D — Dependency Inversion Principle: depend on abstractions, not concretions',
    ],
  },
  {
    heading: '3. Other design principles',
    items: [
      "DRY (Don't Repeat Yourself)",
      'KISS (Keep It Simple, Stupid)',
      "YAGNI (You Aren't Gonna Need It)",
      'Law of Demeter (principle of least knowledge)',
      'Composition over inheritance',
      'Program to an interface, not an implementation',
      'Separation of concerns',
      'GRASP basics: information expert, creator, controller, low coupling, high cohesion',
    ],
  },
  {
    heading: '4. Design Patterns',
    groups: [
      {
        label: 'Creational',
        items: [
          'Singleton (eager, lazy, double-checked locking, enum, Bill Pugh holder)',
          'Factory Method',
          'Abstract Factory',
          'Builder',
          'Prototype',
          'Object Pool',
        ],
      },
      {
        label: 'Structural',
        items: ['Adapter', 'Decorator', 'Facade', 'Proxy', 'Composite', 'Bridge', 'Flyweight'],
      },
      {
        label: 'Behavioral',
        items: [
          'Strategy',
          'Observer',
          'State',
          'Command',
          'Template Method',
          'Chain of Responsibility',
          'Iterator',
          'Mediator',
          'Memento',
          'Visitor',
          'Null Object',
        ],
      },
    ],
  },
  {
    heading: '5. Java Concurrency',
    items: [
      'Thread lifecycle and states, Thread vs Runnable vs Callable',
      'synchronized (method-level and block-level), intrinsic locks/monitors',
      'volatile and the Java memory model, happens-before, visibility vs atomicity',
      'wait(), notify(), notifyAll()',
      'ExecutorService, thread pools, Executors factory methods, ThreadPoolExecutor parameters',
      'Future, CompletableFuture, async composition',
      'ReentrantLock, ReadWriteLock, tryLock, fairness',
      'Condition objects',
      'Atomic classes: AtomicInteger, AtomicLong, AtomicReference, CAS',
      'Concurrent collections: ConcurrentHashMap, CopyOnWriteArrayList, BlockingQueue (ArrayBlockingQueue, LinkedBlockingQueue, PriorityBlockingQueue), ConcurrentLinkedQueue',
      'Synchronizers: CountDownLatch, CyclicBarrier, Semaphore, Phaser',
      'Deadlock, livelock, starvation, race conditions — causes and prevention',
      'ThreadLocal',
      'Producer-consumer pattern',
      'Immutability as a concurrency strategy',
    ],
  },
  {
    heading: '6. Java Collections',
    items: [
      'List: ArrayList, LinkedList, Vector — internals and trade-offs',
      'Set: HashSet, LinkedHashSet, TreeSet',
      'Map: HashMap (buckets, hashing, treeification, resizing), LinkedHashMap (LRU via removeEldestEntry), TreeMap, EnumMap',
      'Queue/Deque: PriorityQueue, ArrayDeque',
      'Time and space complexity of every major operation',
      'Comparable vs Comparator',
      'Iterators, fail-fast vs fail-safe, ConcurrentModificationException',
      'Collections and Arrays utility methods',
      'Sorting stability',
    ],
  },
  {
    heading: '7. Generics',
    items: [
      'Generic classes, methods, and interfaces',
      'Bounded type parameters (extends, super)',
      'Wildcards, PECS (Producer Extends, Consumer Super)',
      'Type erasure and its consequences',
    ],
  },
  {
    heading: '8. Exception Handling',
    items: [
      'Checked vs unchecked vs errors',
      'try/catch/finally, try-with-resources, AutoCloseable',
      'Custom exception hierarchies',
      'Exception chaining, suppressed exceptions',
      'Fail-fast vs fail-safe design',
      'When to throw vs when to handle',
    ],
  },
  {
    heading: '9. Modern Java Idioms',
    items: [
      'Lambdas and functional interfaces (Function, Supplier, Consumer, Predicate, BiFunction)',
      'Streams: intermediate vs terminal ops, map, filter, reduce, collect, Collectors (groupingBy, toMap, joining, partitioningBy)',
      'Optional and correct usage',
      'Enums with fields, constructors, methods, and abstract methods',
      'Records',
      'var, text blocks, switch expressions, sealed classes, pattern matching',
    ],
  },
  {
    heading: '10. UML',
    items: [
      'Class diagrams: classes, attributes, methods, visibility notation',
      'Relationships: association, aggregation, composition, inheritance, realization, dependency — and their arrow notation',
      'Multiplicity notation (1, 0..1, 1..*, *)',
      'Sequence diagrams: lifelines, activation bars, synchronous/asynchronous messages, return messages',
      'Use case diagrams (basic)',
      'State diagrams (basic)',
    ],
  },
  {
    heading: '11. Coding Hygiene',
    items: [
      'Clean code: naming, function size, comments vs self-documenting code',
      'Layered structuring: entity, repository, service, controller',
      'DTOs vs entities, mapping between them',
      'Unit testing with JUnit 5, assertions, lifecycle annotations',
      'Mocking with Mockito: stubbing, verification, argument captors',
      'Test doubles: mock, stub, fake, spy',
    ],
  },
  {
    heading: '12. Basic Data Structures & Complexity',
    items: [
      'Big-O notation for time and space',
      'Arrays, linked lists, stacks, queues, hash tables, trees, heaps, graphs — enough to choose the right one',
      'Recursion basics',
    ],
  },
]

export const HLD_PREREQUISITES: PrereqSection[] = [
  {
    heading: '1. Networking',
    items: [
      'OSI and TCP/IP models',
      'TCP vs UDP, three-way handshake, connection lifecycle',
      'IP addressing, ports, sockets',
      'DNS: resolution flow, records (A, AAAA, CNAME, MX, TXT), TTL, propagation',
      'HTTP/1.1, HTTP/2, HTTP/3 differences (keep-alive, multiplexing, head-of-line blocking)',
      'HTTPS, TLS handshake, certificates',
      'WebSockets, Server-Sent Events, long polling, short polling',
      'gRPC and Protocol Buffers (conceptually)',
      'Latency vs throughput vs bandwidth',
      'CDN fundamentals: edge caching, origin, cache hit ratio',
      'Proxies: forward vs reverse',
      'NAT, firewalls (basic awareness)',
    ],
  },
  {
    heading: '2. REST & API Design',
    items: [
      'Resources, URI design, HTTP verbs and their semantics',
      'Status codes: 2xx, 3xx, 4xx, 5xx — the commonly used ones',
      'Idempotency and safety per verb',
      'Statelessness',
      'Pagination: offset, cursor, keyset',
      'Filtering, sorting, field selection',
      'Versioning strategies: URI, header, content negotiation',
      'Content negotiation, MIME types',
      'HATEOAS (awareness level)',
      'Error response design',
      'Rate limiting from an API perspective',
      'Authentication and authorization: session vs token, JWT structure, OAuth 2.0 flows, API keys, RBAC vs ABAC',
      'CORS',
      'API gateway responsibilities',
    ],
  },
  {
    heading: '3. Databases — Relational',
    items: [
      'Schema design and ER modeling',
      'Normalization: 1NF, 2NF, 3NF, BCNF; denormalization and when to do it',
      'Keys: primary, foreign, composite, surrogate, natural',
      'Joins: inner, left, right, full, cross, self',
      'Indexes: B-tree, hash, clustered vs non-clustered, composite, covering, partial; index selectivity',
      'Query planning: EXPLAIN/EXPLAIN ANALYZE, full scan vs index scan',
      'Transactions and ACID',
      'Isolation levels: read uncommitted, read committed, repeatable read, serializable',
      'Anomalies: dirty read, non-repeatable read, phantom read, lost update, write skew',
      'Locking: shared vs exclusive, row vs table, optimistic vs pessimistic, deadlock detection',
      'MVCC',
      'Connection pooling',
      'Views, materialized views, stored procedures, triggers (awareness)',
      'Window functions, CTEs, aggregations, GROUP BY/HAVING',
    ],
  },
  {
    heading: '4. Databases — NoSQL & Storage',
    items: [
      'Key-value stores (Redis, DynamoDB)',
      'Document stores (MongoDB)',
      'Wide-column stores (Cassandra, HBase)',
      'Graph databases (Neo4j)',
      'Time-series databases (InfluxDB, TimescaleDB)',
      'Search engines (Elasticsearch), inverted indexes',
      'Object/blob storage (S3)',
      'Data warehouses vs OLTP vs OLAP',
      'LSM trees vs B-trees, write vs read amplification',
      'WAL (write-ahead logging)',
      'Bloom filters',
      'Choosing SQL vs NoSQL — the actual decision criteria',
    ],
  },
  {
    heading: '5. Scaling & Distribution',
    items: [
      'Vertical vs horizontal scaling',
      'Stateless vs stateful services',
      'Load balancing: L4 vs L7; algorithms (round robin, weighted, least connections, IP hash, consistent hash); health checks; sticky sessions',
      'Replication: leader-follower, multi-leader, leaderless; sync vs async; replication lag; read replicas',
      'Sharding/partitioning: range, hash, directory, geo; consistent hashing and virtual nodes; hot partitions; resharding',
      'Federation and functional partitioning',
      'Data locality and colocation',
      'Failover, leader election, split-brain',
      'Quorum reads/writes (N, R, W)',
    ],
  },
  {
    heading: '6. Caching',
    items: [
      'Cache layers: client, CDN, application, database',
      'Strategies: cache-aside (lazy loading), read-through, write-through, write-behind, refresh-ahead',
      'Eviction policies: LRU, LFU, FIFO, random, TTL-based',
      'Cache invalidation approaches',
      'Distributed caching, Redis vs Memcached',
      'Cache stampede/thundering herd, hot keys',
      'Cache coherence and consistency trade-offs',
    ],
  },
  {
    heading: '7. Distributed Systems Theory',
    items: [
      'CAP theorem and its practical interpretation',
      'PACELC theorem',
      'Consistency models: strong, eventual, causal, read-your-writes, monotonic reads',
      'BASE vs ACID',
      'Consensus: Paxos, Raft (conceptual understanding, leader election, log replication)',
      'Distributed transactions: two-phase commit, three-phase commit',
      'Saga pattern: choreography vs orchestration; compensating transactions',
      'Idempotency in distributed systems',
      'Exactly-once vs at-least-once vs at-most-once delivery',
      'Clock problems: NTP drift, logical clocks, vector clocks, Lamport timestamps',
      'Distributed ID generation: UUID, Snowflake, ULID, ticket servers',
      'Gossip protocol',
      'Heartbeats and failure detection',
      'Split-brain and fencing tokens',
    ],
  },
  {
    heading: '8. Messaging & Async',
    items: [
      'Message queue vs pub/sub vs event streaming',
      'Kafka concepts: topics, partitions, offsets, consumer groups, replication, retention, ordering guarantees',
      'RabbitMQ concepts: exchanges, bindings, queues, routing keys',
      'Producer/consumer semantics, acknowledgments',
      'Dead letter queues, retries, exponential backoff, poison messages',
      'Event-driven architecture, event sourcing, CQRS',
      'Outbox pattern',
      'Backpressure',
      'Batch vs stream processing',
    ],
  },
  {
    heading: '9. Architecture Patterns',
    items: [
      'Monolith vs modular monolith vs microservices — trade-offs',
      'Service discovery, service registry',
      'API gateway, BFF (backend for frontend)',
      'Sidecar and service mesh (awareness)',
      'Layered, hexagonal, and clean architecture',
      'Domain-driven design basics: bounded context, aggregate, entity, value object',
      'Strangler fig migration pattern',
      'Serverless and FaaS (awareness)',
    ],
  },
  {
    heading: '10. Reliability & Resilience',
    items: [
      'Availability math: nines, uptime calculations, availability in series vs parallel',
      'SLA, SLO, SLI',
      'Single points of failure',
      'Redundancy: active-active vs active-passive',
      'Circuit breaker, bulkhead, retry with jitter, timeouts, fallback',
      'Graceful degradation',
      'Rate limiting algorithms: token bucket, leaky bucket, fixed window, sliding window log, sliding window counter',
      'Throttling and load shedding',
      'Chaos engineering (awareness)',
      'Disaster recovery: RTO, RPO, backups, multi-region',
    ],
  },
  {
    heading: '11. Observability & Operations',
    items: [
      'Logging: structured logs, log levels, centralized aggregation (ELK)',
      'Metrics: counters, gauges, histograms; Prometheus/Grafana; RED and USE methods',
      'Distributed tracing: spans, trace IDs, context propagation (OpenTelemetry, Jaeger)',
      'Alerting and on-call basics',
      'Health checks: liveness vs readiness',
      'Deployment strategies: blue-green, canary, rolling, feature flags',
      'CI/CD pipeline concepts',
      'Containers and Docker basics; Kubernetes at a conceptual level',
      'Infrastructure as code (awareness)',
    ],
  },
  {
    heading: '12. Security',
    items: [
      'Authentication vs authorization',
      'Encryption at rest and in transit',
      'Hashing vs encryption; password hashing (bcrypt, Argon2), salting',
      'OWASP Top 10: injection, XSS, CSRF, broken auth, SSRF, etc.',
      'SQL injection prevention (parameterized queries)',
      'Secrets management',
      'Principle of least privilege',
      'DDoS mitigation',
    ],
  },
  {
    heading: '13. Estimation & Analysis',
    items: [
      'Powers of two, data size units',
      'Latency numbers every engineer should know (memory, SSD, disk, network round trips)',
      'QPS/RPS calculation, peak vs average traffic',
      'Storage estimation and growth projection',
      'Bandwidth estimation',
      'Server/instance count estimation',
      'Read:write ratio reasoning',
      'Hot/cold data separation',
    ],
  },
  {
    heading: '14. Operating Systems & Fundamentals',
    items: [
      'Process vs thread, context switching',
      'Memory: heap vs stack, virtual memory, paging',
      'File I/O, blocking vs non-blocking, sync vs async',
      'I/O models: blocking, non-blocking, multiplexing (select/epoll)',
      'CPU-bound vs I/O-bound workloads',
      'Serialization formats: JSON, Protobuf, Avro, Thrift — trade-offs',
      'Compression basics',
      'Hashing: cryptographic vs non-cryptographic, collisions',
    ],
  },
]

export function prereqNotes(sections: PrereqSection[]): string {
  return sections
    .map((s) => {
      const body = s.items
        ? s.items.map((i) => `- ${i}`).join('\n')
        : (s.groups ?? []).map((g) => `**${g.label}**\n${g.items.map((i) => `- ${i}`).join('\n')}`).join('\n\n')
      return `## ${s.heading}\n${body}`
    })
    .join('\n\n')
}

export function prereqSubtopicTexts(sections: PrereqSection[]): string[] {
  return sections.map((s) => s.heading)
}

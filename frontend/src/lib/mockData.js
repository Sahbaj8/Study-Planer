// Initial fallback demo dataset when Supabase is not configured yet

export const MOCK_CURRENT_USER = {
  id: 'usr_demo_101',
  email: 'alex.student@studyhive.io',
  full_name: 'Alex Rivera',
  avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=AlexRivera',
};

export const MOCK_ROOMS = [
  {
    id: 'rm_cs101_dev',
    code: 'CS101-GO',
    name: '💻 CS101 Algorithms & Data Structures',
    description: 'Preparing for midterm exam! Working on binary trees, graph algorithms, and dynamic programming.',
    creator_id: 'usr_demo_101',
    creator_name: 'Alex Rivera',
    creator_avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=AlexRivera',
    focus_duration: 25,
    break_duration: 5,
    members_count: 4,
    created_at: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    members: [
      { id: 'usr_demo_101', full_name: 'Alex Rivera', avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=AlexRivera', role: 'host' },
      { id: 'usr_demo_102', full_name: 'Sophia Chen', avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Sophia', role: 'member' },
      { id: 'usr_demo_103', full_name: 'Marcus Vance', avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Marcus', role: 'member' },
      { id: 'usr_demo_104', full_name: 'Emma Watson', avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Emma', role: 'member' }
    ]
  },
  {
    id: 'rm_calc3_math',
    code: 'MATH-99X',
    name: '📐 Calculus III Multi-Variable Group',
    description: 'Solving partial derivatives and vector calculus exercises.',
    creator_id: 'usr_demo_102',
    creator_name: 'Sophia Chen',
    creator_avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Sophia',
    focus_duration: 50,
    break_duration: 10,
    members_count: 3,
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    members: [
      { id: 'usr_demo_102', full_name: 'Sophia Chen', avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Sophia', role: 'host' },
      { id: 'usr_demo_101', full_name: 'Alex Rivera', avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=AlexRivera', role: 'member' }
    ]
  },
  {
    id: 'rm_phys2_lab',
    code: 'PHYS-202',
    name: '⚡ Physics II Quantum & Electromagnetism',
    description: 'Maxwell equations, electromagnetic waves & lab reports.',
    creator_id: 'usr_demo_103',
    creator_name: 'Marcus Vance',
    creator_avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Marcus',
    focus_duration: 25,
    break_duration: 5,
    members_count: 5,
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    members: [
      { id: 'usr_demo_103', full_name: 'Marcus Vance', avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Marcus', role: 'host' },
      { id: 'usr_demo_101', full_name: 'Alex Rivera', avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=AlexRivera', role: 'member' }
    ]
  }
];

export const MOCK_NOTES = {
  'rm_cs101_dev': `### 📝 CS101 Algorithms Shared Study Sheet

#### 1. Binary Search Tree (BST) Properties:
- Left subtree contains only nodes with keys **less** than the node's key.
- Right subtree contains only nodes with keys **greater** than the node's key.
- Search Time Complexity: Average **O(log n)**, Worst **O(n)**.

#### 2. Graph Traversal:
- **BFS (Breadth-First Search)**: Uses a Queue (FIFO). Good for shortest path.
- **DFS (Depth-First Search)**: Uses a Stack/Recursion (LIFO). Good for topological sorting & cycle detection.

#### 3. Midterm Todo List:
- [x] Review Big-O space complexity
- [ ] Solve 3 LeetCode DP problems
- [ ] Practice Dijkstra Algorithm step-by-step
`,
  'rm_calc3_math': `### 📐 Calculus III Formula Reference
- Gradient vector: $\\nabla f = \\langle f_x, f_y, f_z \\rangle$
- Divergence: $\\nabla \\cdot \\vec{F}$
- Curl: $\\nabla \\times \\vec{F}$
`
};

export const MOCK_MESSAGES = {
  'rm_cs101_dev': [
    {
      id: 'msg_101',
      room_id: 'rm_cs101_dev',
      user_id: 'usr_demo_102',
      user_name: 'Sophia Chen',
      avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Sophia',
      content: 'Hey everyone! Ready for the 25 min focus sprint?',
      created_at: new Date(Date.now() - 60000 * 15).toISOString()
    },
    {
      id: 'msg_102',
      room_id: 'rm_cs101_dev',
      user_id: 'usr_demo_101',
      user_name: 'Alex Rivera',
      avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=AlexRivera',
      content: 'Yes! Added the graph traversal notes in the shared doc.',
      created_at: new Date(Date.now() - 60000 * 12).toISOString()
    },
    {
      id: 'msg_103',
      room_id: 'rm_cs101_dev',
      user_id: 'usr_demo_103',
      user_name: 'Marcus Vance',
      avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Marcus',
      content: 'Awesome! Muting mics and starting focus session now. 🚀',
      created_at: new Date(Date.now() - 60000 * 8).toISOString()
    }
  ]
};

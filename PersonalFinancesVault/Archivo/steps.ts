import data from '../scripts/data.json'

export type StepOption = {
  label: string
  points?: number
  nextStep: string
}

export type Step = {
  key: string
  label: string
  content: {
    question: string
    options?: StepOption[]
    description?: string
  }
}

enum NodeTypes {
  TITLE = 'title',
  QUESTION = 'question',
  ENDPOINT = 'endpoint',
  DEFINITION = 'definition',
  ARROW = 'arrow',
  ACTION = 'action',
}

type StepNode = {
  id: string
  value: string
  type: NodeTypes
}

type TitleNode = StepNode & {}
type QuestionNode = StepNode & {}
type EndpointNode = StepNode & {}
type DefinitionNode = StepNode & {}
type ArrowNode = StepNode & {
  target: string
  source: string
}
type ActionNode = StepNode & {}

type Data = {
  title: TitleNode[]
  question: QuestionNode[]
  endpoint: EndpointNode[]
  definition: DefinitionNode[]
  arrow: ArrowNode[]
  action: ActionNode[]
}

export const defaultStep = {
  key: 'default',
  label: 'Default',
  content: {question: 'Default'},
}

const getNodeType = (id: string): string => id.split('_')[0]

const getNodeByID = (id: StepNode['id']): StepNode => {
  const type = getNodeType(id)
  if (!data[type as keyof Data]) {
    throw new Error(`Invalid node type ${type} for node ${id}`)
  }
  const node = data[type as keyof Data]?.find(node => node.id === id) as StepNode
  if (!node) {
    throw new Error(`Node ${id} not found`)
  }
  return node
}

const execActions = (node: ActionNode) => {
  if (node.value) {
    // console.log(node.value);
  }
}

const getDirectChild = (node: StepNode): StepNode => {
  const arrows = data.arrow.filter(a => a.source === node.id)
  if (arrows.length > 1) {
    throw new Error(`Multiple arrows not supported on getDirectChild for node ${node.id}`)
  }
  if (arrows.length === 0) {
    throw new Error(`No arrows found on getDirectChild for node ${node.id}`)
  }
  return getNodeByID(arrows[0].target)
}

const getDirectChildren = (node: StepNode): StepNode[] => {
  const arrows = data.arrow.filter(a => a.source === node.id)
  return [
    ...arrows.map(arrow => getNodeByID(arrow.id)),
    ...arrows.map(arrow => getNodeByID(arrow.target)),
  ]
}

const getAllChildren = (node: StepNode, visited = new Set<string>()): StepNode[] => {
  if (visited.has(node.id)) {
    return []
  }
  visited.add(node.id)
  const children = getDirectChildren(node).filter(child => !visited.has(child.id))
  const allChildren = children.flatMap(child => getAllChildren(child, visited))
  return [...children, ...allChildren]
}

const getNodeOptions = (node: StepNode, nodes: StepNode[]): StepOption[] => {
  const options: StepOption[] = []
  ;(nodes.filter(n => n.type === NodeTypes.ARROW) as ArrowNode[])
    .filter(arrow => arrow.source === node.id)
    .forEach(arrow => {
      const target = getNodeByID(arrow.target)
      if (!['action', 'question'].includes(target.type)) {
        return
      }
      if (target.type === NodeTypes.ACTION && !target.value) {
        // TODO: Skipping until data is fixed
        // throw new Error(`Action node ${target.id} has no value`);
      }
      const node: StepOption = {
        label: arrow.value || '¯\\_(ツ)_/¯',
        nextStep: getDirectChild(target).id,
      }
      if (target.type === 'action') {
        execActions(target)
      }
      options.push(node)
    })
  return options
}

const getNodeDefinition = (node: StepNode, nodes: StepNode[]): string => {
  let definition = ''
  ;(nodes.filter(n => n.type === NodeTypes.ARROW) as ArrowNode[])
    .filter(arrow => arrow.source === node.id)
    .forEach(arrow => {
      const target = getNodeByID(arrow.target)
      if (target.type === 'definition') {
        definition = target.value
      }
    })
  return definition
}

const nodesToSteps = (nodes: StepNode[]): Step[] => {
  return nodes
    .filter(n => n.type === NodeTypes.QUESTION)
    .map(q => {
      return {
        key: q.id,
        label: q.value,
        content: {
          question: q.value,
          options: getNodeOptions(q as StepNode, nodes),
          description: getNodeDefinition(q as StepNode, nodes),
        },
      }
    })
}

const getStepsByCategories = (): {[key: string]: Step[]} => {
  const categoryNodes = data.title
  const stepsByCategory: {[key: string]: Step[]} = {}
  categoryNodes.forEach(categoryNode => {
    const children = getAllChildren(categoryNode as StepNode)
    console.log(children)
    if (!stepsByCategory[categoryNode.value] && children.length > 0) {
      stepsByCategory[categoryNode.value] = []
      stepsByCategory[categoryNode.value].push(...nodesToSteps(children))
    }
  })
  return stepsByCategory
}

const stepsByCategory = getStepsByCategories()

export default stepsByCategory.Deuda

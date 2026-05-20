import {useEffect, useRef} from 'react'
import * as go from 'gojs'
import {Box, Stack, Typography} from '@mui/material'
import {
  CATEGORIES,
  CATEGORY_ORDER,
  SECTION_SCORE_NODES,
  SUMMARY_NODE,
  findSectionScoreNode,
  type DiagnosisCategoryId,
  type DiagnosisQuestion,
} from '../../content/diagnosis'
import {buildEdges, EDGE_LEGEND, type EdgeKind, type RawEdge} from './edges'

/**
 * Grafo del cuestionario montado sobre GoJS.
 *
 * Estructura visual:
 *
 *   - Cada categoría financiera (`base` / `debt` / `stability` /
 *     `investment`) es un `Group` con layout interno
 *     `LayeredDigraphLayout` vertical. El raíz también vertical, así
 *     toda la página corre arriba-abajo.
 *   - Dentro de cada Group: las preguntas de la categoría +
 *     `__sectionScore__{cat}`, un nodo sintético al final que
 *     representa la pantalla de puntaje por sección que el usuario ve
 *     entre categorías.
 *   - Después del último Group, fuera de cualquier grupo, vive
 *     `__summary__`: nodo sintético del diagnóstico final.
 *
 * Templates de nodo (`nodeCategoryProperty: 'kind'`):
 *
 *   - `question` — rounded rectangle compacto (default).
 *   - `gate` — rombo, para preguntas cuyo storageKey es source de
 *     una arista de salto (toggle/chips con dependientes).
 *   - `sectionScore` — capsule en color sólido de la categoría.
 *   - `summary` — rectángulo prominente con borde grueso.
 *
 * El nodo no muestra detalle inline. Click → callback
 * `onNodeClick(key)` que el padre usa para abrir el Drawer derecho.
 * Para keys sintéticas (sectionScore / summary), el padre puede no
 * mostrar nada (no son `DiagnosisQuestion`).
 */

type Props = {
  questions: readonly DiagnosisQuestion[]
  selectedKey?: string | null
  onNodeClick?: (storageKey: string | null) => void
  height?: number
}

type FlatQuestion = {
  key: string
  kind: 'question' | 'gate'
  group: DiagnosisCategoryId
  title: string
  type: string
}

type FlatSectionScore = {
  key: string
  kind: 'sectionScore'
  group: DiagnosisCategoryId
  title: string
  categoryColor: string
}

type FlatSummary = {
  key: string
  kind: 'summary'
  title: string
}

type FlatGroup = {
  key: DiagnosisCategoryId
  isGroup: true
  label: string
  color: string
}

type FlatLink = {
  id: string
  from: string
  to: string
  kind: EdgeKind
  label?: string
}

const CATEGORY_COLOR: Record<DiagnosisCategoryId, string> = {
  profile: '#1976d2',
  income: '#2e7d32',
  expenses: '#ed6c02',
  habits: '#0288d1',
  debt: '#d84315',
  stability: '#0277bd',
  protection: '#9c27b0',
  investment: '#388e3c',
}

/**
 * Helper local: la key del nodo de puntaje de sección viene del nodo
 * canónico declarado en `SECTION_SCORE_NODES`. Lookup centralizado para
 * que `transformEdges` no inline strings.
 */
const sectionScoreKey = (cat: DiagnosisCategoryId): string =>
  findSectionScoreNode(cat)?.storageKey ?? ''

const EDGE_STYLE: Record<EdgeKind, {stroke: string; dash?: number[]; legend: string}> = {
  flow: {stroke: '#475569', legend: EDGE_LEGEND.flow},
  skip: {stroke: '#ed6c02', legend: EDGE_LEGEND.skip},
  derivation: {stroke: '#1976d2', dash: [6, 4], legend: EDGE_LEGEND.derivation},
  rowSource: {stroke: '#00897b', dash: [2, 4], legend: EDGE_LEGEND.rowSource},
  insight: {stroke: '#9c27b0', dash: [1, 3], legend: EDGE_LEGEND.insight},
}

// ---------- Construcción del modelo ----------

const transformEdges = (
  questions: readonly DiagnosisQuestion[],
  rawEdges: readonly RawEdge[],
): RawEdge[] => {
  const catOf = (k: string): DiagnosisCategoryId | null =>
    questions.find(q => q.storageKey === k)?.category ?? null

  const out: RawEdge[] = []

  for (const e of rawEdges) {
    if (e.kind !== 'flow' && e.kind !== 'skip') {
      out.push(e)
      continue
    }
    const sCat = catOf(e.source)
    const tCat = catOf(e.target)
    if (!sCat || !tCat || sCat === tCat) {
      out.push(e)
      continue
    }
    // Cruce de categorías → pasamos por el sectionScore de origen
    if (e.kind === 'flow') {
      out.push({source: e.source, target: sectionScoreKey(sCat), kind: 'flow', label: e.label})
      out.push({source: sectionScoreKey(sCat), target: e.target, kind: 'flow'})
    } else {
      out.push({source: e.source, target: sectionScoreKey(sCat), kind: 'skip', label: e.label})
    }
  }

  // Flow de la última pregunta a su sectionScore (no lo genera buildEdges)
  const lastQ = questions[questions.length - 1]
  if (lastQ) {
    out.push({
      source: lastQ.storageKey,
      target: sectionScoreKey(lastQ.category),
      kind: 'flow',
    })
  }

  // sectionScore de la última categoría presente → summary
  const presentCats = CATEGORY_ORDER.filter(c => questions.some(q => q.category === c))
  const lastCat = presentCats[presentCats.length - 1]
  if (lastCat) {
    out.push({
      source: sectionScoreKey(lastCat),
      target: SUMMARY_NODE.storageKey,
      kind: 'flow',
    })
  }

  return out
}

const buildModel = (
  questions: readonly DiagnosisQuestion[],
): {
  groups: FlatGroup[]
  questionNodes: FlatQuestion[]
  sectionScoreNodes: FlatSectionScore[]
  summaryNode: FlatSummary
  links: FlatLink[]
} => {
  const rawEdges = buildEdges(questions)

  // Un nodo es "gate" si genera al menos una arista de salto.
  const gateKeys = new Set<string>()
  for (const e of rawEdges) if (e.kind === 'skip') gateKeys.add(e.source)

  const presentCats = CATEGORY_ORDER.filter(c => questions.some(q => q.category === c))

  const groups: FlatGroup[] = presentCats.map(cat => ({
    key: cat,
    isGroup: true,
    label: CATEGORIES[cat].label,
    color: CATEGORY_COLOR[cat],
  }))

  const questionNodes: FlatQuestion[] = questions.map(q => ({
    key: q.storageKey,
    kind: gateKeys.has(q.storageKey) ? 'gate' : 'question',
    group: q.category,
    title: q.title,
    type: q.type,
  }))

  const sectionScoreNodes: FlatSectionScore[] = SECTION_SCORE_NODES.filter(n =>
    presentCats.includes(n.category),
  ).map(n => ({
    key: n.storageKey,
    kind: 'sectionScore',
    group: n.category,
    title: n.title,
    categoryColor: CATEGORY_COLOR[n.category],
  }))

  const summaryNode: FlatSummary = {
    key: SUMMARY_NODE.storageKey,
    kind: 'summary',
    title: SUMMARY_NODE.title,
  }

  const links: FlatLink[] = transformEdges(questions, rawEdges).map((e, i) => ({
    id: `e-${i}`,
    from: e.source,
    to: e.target,
    kind: e.kind,
    label: e.label,
  }))

  return {groups, questionNodes, sectionScoreNodes, summaryNode, links}
}

// ---------- Templates GoJS ----------

const $ = go.GraphObject.make

const NODE_WIDTH = 240

const buildQuestionTemplate = (): go.Node =>
  $(
    go.Node,
    'Auto',
    {
      selectionAdorned: true,
      movable: false,
      locationSpot: go.Spot.Center,
      cursor: 'pointer',
    },
    $(
      go.Shape,
      'RoundedRectangle',
      {
        fill: '#ffffff',
        stroke: '#cbd5e1',
        strokeWidth: 1,
        parameter1: 8,
        minSize: new go.Size(NODE_WIDTH, NaN),
      },
      new go.Binding('stroke', 'isHighlighted', (h: boolean) =>
        h ? '#0f172a' : '#cbd5e1',
      ).ofObject(),
      new go.Binding('strokeWidth', 'isHighlighted', (h: boolean) => (h ? 2 : 1)).ofObject(),
    ),
    $(
      go.Panel,
      'Vertical',
      {defaultAlignment: go.Spot.Left, padding: new go.Margin(10, 14, 10, 14)},

      $(
        go.TextBlock,
        {
          font: '600 13px Inter, system-ui, sans-serif',
          stroke: '#0f172a',
          wrap: go.TextBlock.WrapDesiredSize,
          maxSize: new go.Size(NODE_WIDTH, NaN),
        },
        new go.Binding('text', 'title'),
      ),
      $(
        go.TextBlock,
        {
          font: '10.5px ui-monospace, SFMono-Regular, monospace',
          stroke: '#64748b',
          margin: new go.Margin(2, 0, 0, 0),
        },
        new go.Binding('text', 'key'),
      ),
      $(
        go.Panel,
        'Auto',
        {alignment: go.Spot.Left, margin: new go.Margin(6, 0, 0, 0)},
        $(go.Shape, 'RoundedRectangle', {
          fill: 'transparent',
          stroke: '#cbd5e1',
          strokeWidth: 1,
          parameter1: 4,
        }),
        $(
          go.TextBlock,
          {
            font: '10px Inter, system-ui, sans-serif',
            stroke: '#64748b',
            margin: new go.Margin(2, 6, 2, 6),
          },
          new go.Binding('text', 'type'),
        ),
      ),
    ),
  )

const buildGateTemplate = (): go.Node =>
  $(
    go.Node,
    'Spot',
    {
      selectionAdorned: true,
      movable: false,
      locationSpot: go.Spot.Center,
      cursor: 'pointer',
    },
    $(
      go.Shape,
      {
        figure: 'Diamond',
        fill: '#ffffff',
        stroke: '#cbd5e1',
        strokeWidth: 1,
        desiredSize: new go.Size(220, 130),
      },
      new go.Binding('stroke', 'isHighlighted', (h: boolean) =>
        h ? '#0f172a' : '#cbd5e1',
      ).ofObject(),
      new go.Binding('strokeWidth', 'isHighlighted', (h: boolean) => (h ? 2 : 1)).ofObject(),
    ),
    $(
      go.Panel,
      'Vertical',
      {alignment: go.Spot.Center, defaultAlignment: go.Spot.Center, width: 150},
      $(
        go.TextBlock,
        {
          font: '600 12.5px Inter, system-ui, sans-serif',
          stroke: '#0f172a',
          textAlign: 'center',
          wrap: go.TextBlock.WrapDesiredSize,
          maxSize: new go.Size(140, NaN),
        },
        new go.Binding('text', 'title'),
      ),
      $(
        go.TextBlock,
        {
          font: '10px ui-monospace, SFMono-Regular, monospace',
          stroke: '#64748b',
          textAlign: 'center',
          margin: new go.Margin(2, 0, 4, 0),
        },
        new go.Binding('text', 'key'),
      ),
      $(
        go.Panel,
        'Auto',
        {alignment: go.Spot.Center},
        $(go.Shape, 'RoundedRectangle', {
          fill: 'transparent',
          stroke: '#cbd5e1',
          strokeWidth: 1,
          parameter1: 4,
        }),
        $(
          go.TextBlock,
          {
            font: '9.5px Inter, system-ui, sans-serif',
            stroke: '#64748b',
            margin: new go.Margin(1, 5, 1, 5),
          },
          new go.Binding('text', 'type'),
        ),
      ),
    ),
  )

const buildSectionScoreTemplate = (): go.Node =>
  $(
    go.Node,
    'Auto',
    {
      selectionAdorned: true,
      movable: false,
      locationSpot: go.Spot.Center,
      cursor: 'pointer',
    },
    $(
      go.Shape,
      'RoundedRectangle',
      {
        strokeWidth: 0,
        parameter1: 24,
        minSize: new go.Size(NODE_WIDTH, NaN),
      },
      new go.Binding('fill', 'categoryColor'),
      new go.Binding('strokeWidth', 'isHighlighted', (h: boolean) => (h ? 2 : 0)).ofObject(),
      new go.Binding('stroke', 'isHighlighted', (h: boolean) =>
        h ? '#0f172a' : 'transparent',
      ).ofObject(),
    ),
    $(
      go.Panel,
      'Vertical',
      {
        alignment: go.Spot.Center,
        defaultAlignment: go.Spot.Center,
        padding: new go.Margin(12, 18, 12, 18),
      },
      $(
        go.TextBlock,
        {
          font: 'bold 13px Inter, system-ui, sans-serif',
          stroke: '#ffffff',
          textAlign: 'center',
          wrap: go.TextBlock.WrapDesiredSize,
          maxSize: new go.Size(220, NaN),
        },
        new go.Binding('text', 'title'),
      ),
    ),
  )

const buildSummaryTemplate = (): go.Node =>
  $(
    go.Node,
    'Auto',
    {
      selectionAdorned: true,
      movable: false,
      locationSpot: go.Spot.Center,
      cursor: 'pointer',
    },
    $(
      go.Shape,
      'RoundedRectangle',
      {
        fill: '#0f172a',
        stroke: '#0f172a',
        strokeWidth: 0,
        parameter1: 12,
        minSize: new go.Size(280, NaN),
      },
      new go.Binding('strokeWidth', 'isHighlighted', (h: boolean) => (h ? 2 : 0)).ofObject(),
      new go.Binding('stroke', 'isHighlighted', (h: boolean) =>
        h ? '#fbbf24' : '#0f172a',
      ).ofObject(),
    ),
    $(
      go.Panel,
      'Vertical',
      {
        alignment: go.Spot.Center,
        defaultAlignment: go.Spot.Center,
        padding: new go.Margin(16, 22, 16, 22),
      },
      $(
        go.TextBlock,
        {
          font: 'bold 15px Inter, system-ui, sans-serif',
          stroke: '#ffffff',
          textAlign: 'center',
        },
        new go.Binding('text', 'title'),
      ),
    ),
  )

const buildGroupTemplate = (): go.Group =>
  $(
    go.Group,
    'Auto',
    {
      layout: $(go.LayeredDigraphLayout, {
        direction: 90,
        layerSpacing: 40,
        columnSpacing: 30,
        setsPortSpots: false,
      }),
      isSubGraphExpanded: true,
      selectable: false,
      movable: false,
      computesBoundsAfterDrag: true,
    },
    $(
      go.Shape,
      'RoundedRectangle',
      {strokeWidth: 1, fill: '#ffffff', parameter1: 12},
      new go.Binding('fill', 'color', (c: string) => `${c}0a`),
      new go.Binding('stroke', 'color', (c: string) => `${c}55`),
    ),
    $(
      go.Panel,
      'Vertical',
      {defaultAlignment: go.Spot.Left, padding: new go.Margin(14, 18, 18, 18)},
      $(
        go.Panel,
        'Horizontal',
        {alignment: go.Spot.Left, margin: new go.Margin(0, 0, 14, 0)},
        $(
          go.Shape,
          'Rectangle',
          {width: 4, height: 22, strokeWidth: 0},
          new go.Binding('fill', 'color'),
        ),
        $(
          go.TextBlock,
          {
            margin: new go.Margin(0, 0, 0, 10),
            font: 'bold 13px Inter, system-ui, sans-serif',
            isMultiline: false,
          },
          new go.Binding('text', 'label'),
          new go.Binding('stroke', 'color'),
        ),
      ),
      $(go.Placeholder, {padding: 0}),
    ),
  )

const buildLinkTemplate = (): go.Link =>
  $(
    go.Link,
    {
      routing: go.Link.AvoidsNodes,
      corner: 8,
      toShortLength: 4,
      selectable: false,
    },
    $(
      go.Shape,
      {strokeWidth: 1.5},
      new go.Binding('stroke', 'kind', (k: EdgeKind) => EDGE_STYLE[k].stroke),
      new go.Binding('strokeDashArray', 'kind', (k: EdgeKind) => EDGE_STYLE[k].dash ?? null),
      new go.Binding('strokeWidth', 'isHighlighted', (h: boolean) => (h ? 2.5 : 1.5)).ofObject(),
    ),
    $(
      go.Shape,
      {toArrow: 'standard', strokeWidth: 0, scale: 1.1},
      new go.Binding('fill', 'kind', (k: EdgeKind) => EDGE_STYLE[k].stroke),
    ),
    $(
      go.Panel,
      'Auto',
      new go.Binding('visible', 'label', (l: string | undefined) => !!l),
      $(go.Shape, 'RoundedRectangle', {
        fill: 'rgba(255, 255, 255, 0.95)',
        stroke: '#cbd5e1',
        strokeWidth: 0.5,
        parameter1: 3,
      }),
      $(
        go.TextBlock,
        {
          font: '10px ui-monospace, SFMono-Regular, monospace',
          stroke: '#1e293b',
          margin: new go.Margin(2, 5, 2, 5),
          maxSize: new go.Size(160, NaN),
          wrap: go.TextBlock.WrapDesiredSize,
        },
        new go.Binding('text', 'label', (l: string | undefined) => l ?? ''),
      ),
    ),
  )

const initDiagram = (host: HTMLDivElement): go.Diagram => {
  const diagram = $(go.Diagram, host, {
    'undoManager.isEnabled': false,
    initialAutoScale: go.Diagram.Uniform,
    layout: $(go.LayeredDigraphLayout, {
      direction: 90,
      layerSpacing: 60,
      columnSpacing: 30,
      setsPortSpots: false,
    }),
    'animationManager.isEnabled': false,
    contentAlignment: go.Spot.TopCenter,
    'toolManager.hoverDelay': 100,
  })

  diagram.nodeTemplateMap.add('question', buildQuestionTemplate())
  diagram.nodeTemplateMap.add('gate', buildGateTemplate())
  diagram.nodeTemplateMap.add('sectionScore', buildSectionScoreTemplate())
  diagram.nodeTemplateMap.add('summary', buildSummaryTemplate())
  diagram.groupTemplate = buildGroupTemplate()
  diagram.linkTemplate = buildLinkTemplate()

  return diagram
}

// ---------- Componente React ----------

export default function DebugGraph({questions, selectedKey, onNodeClick, height = 1100}: Props) {
  const hostRef = useRef<HTMLDivElement | null>(null)
  const diagramRef = useRef<go.Diagram | null>(null)
  const onNodeClickRef = useRef(onNodeClick)
  onNodeClickRef.current = onNodeClick

  useEffect(() => {
    if (!hostRef.current) return
    const diagram = initDiagram(hostRef.current)
    diagramRef.current = diagram

    const {groups, questionNodes, sectionScoreNodes, summaryNode, links} = buildModel(questions)

    diagram.model = $(go.GraphLinksModel, {
      nodeKeyProperty: 'key',
      linkKeyProperty: 'id',
      nodeCategoryProperty: 'kind',
      nodeDataArray: [...groups, ...questionNodes, ...sectionScoreNodes, summaryNode],
      linkDataArray: links,
    })

    const onSelectionChanged = () => {
      diagram.startTransaction('hl')
      diagram.links.each(l => {
        l.isHighlighted = false
      })
      const sel = diagram.selection.first()
      if (sel instanceof go.Node) {
        sel.findLinksConnected().each(l => {
          l.isHighlighted = true
        })
        if (onNodeClickRef.current) onNodeClickRef.current(sel.key as string)
      } else if (onNodeClickRef.current) {
        onNodeClickRef.current(null)
      }
      diagram.commitTransaction('hl')
    }
    diagram.addDiagramListener('ChangedSelection', onSelectionChanged)

    return () => {
      diagram.removeDiagramListener('ChangedSelection', onSelectionChanged)
      diagram.div = null
      diagramRef.current = null
    }
  }, [questions])

  // Sincronizar selección desde el padre (cierre del Drawer → deselect).
  useEffect(() => {
    const diagram = diagramRef.current
    if (!diagram) return
    const current = diagram.selection.first()
    const currentKey = current instanceof go.Node ? (current.key as string) : null
    if (currentKey === (selectedKey ?? null)) return
    diagram.startTransaction('select')
    diagram.clearSelection()
    if (selectedKey) {
      const node = diagram.findNodeForKey(selectedKey)
      if (node) node.isSelected = true
    }
    diagram.commitTransaction('select')
  }, [selectedKey])

  return (
    <Stack spacing={2}>
      <Stack direction='row' spacing={2} sx={{flexWrap: 'wrap', gap: 1.5, alignItems: 'center'}}>
        <Typography variant='caption' color='text.secondary'>
          Aristas:
        </Typography>
        {(Object.keys(EDGE_STYLE) as EdgeKind[]).map(k => {
          const s = EDGE_STYLE[k]
          return (
            <Stack key={k} direction='row' spacing={0.5} sx={{alignItems: 'center'}}>
              <Box
                sx={{
                  width: 28,
                  height: 0,
                  borderTop: '2px solid',
                  borderTopColor: s.stroke,
                  borderStyle: s.dash ? 'dashed' : 'solid',
                }}
              />
              <Typography variant='caption'>{s.legend}</Typography>
            </Stack>
          )
        })}
      </Stack>

      <Box
        ref={hostRef}
        sx={{
          width: '100%',
          height,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          bgcolor: '#fafafa',
        }}
      />
    </Stack>
  )
}

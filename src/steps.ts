export type Options = {
  label: string
  points?: number
  nextStep: string
}

type ContentType = {
  question: string
  options?: Options[]
  description?: string
}

export type StepType = {
  key: string;
  label: string;
  content: ContentType;
}

export const defaultStep = {
  key: 'default',
  label: 'Default',
  content: { question: 'Default' }
}

const steps: StepType[] = [
  {
    "key": "Init",
    "label": "Bienvenido",
    "content": {
      "question": "¡Bienvenido! ¿Estás listo para comenzar?",
      "description": "Este test te ayudará a conocer tu nivel de educación financiera.",
      "options": [
        {
          "label": "Vamos",
          "nextStep": "debt"
        },
      ]
    }
  },
  {
    "key": "debt",
    "label": "Deuda",
    "content": {
      "question": "¿Tienes deuda?",
      "options": [
        {
          "label": "Sí",
          "nextStep": "debt_type"
        },
        {
          "label": "No",
          "points": 10
        }
      ]
    }
  },
  {
    "key": "debt_type",
    "label": "Tipo de deuda",
    "content": {
      "question": "¿Tus deudas son buenas o malas?",
      "description": "Las deudas buenas son aquellas que te permiten generar más dinero, como un crédito para un negocio. Las deudas malas son aquellas que te generan más deudas, como un crédito para comprar un televisor.",
      "options": [
        {
          "label": "Buenas",
          "points": 10
        },
        {
          "label": "Malas",
          "points": -10
        },
        {
          "label": "Ambas",
          "points": 0
        }
      ]
    }
  },
  {
    "key": "ItemThree",
    "label": "Item Three",
    "content": {
      "question": "Item Three"
    }
  },
  {
    "key": "ItemFour",
    "label": "Item Four",
    "content": {
      "question": "Item Four"
    }
  },
  {
    "key": "ItemFive",
    "label": "Item Five",
    "content": {
      "question": "Item Five"
    }
  },
  {
    "key": "ItemSix",
    "label": "Item Six",
    "content": {
      "question": "Item Six"
    }
  },
  {
    "key": "ItemSeven",
    "label": "Item Seven",
    "content": {
      "question": "Item Seven"
    }
  }
]

export default steps
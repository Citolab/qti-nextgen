import type { Action } from '../../model';

export const actions: Action[] = [
  {
    id: 'alternative',
    title: 'Alternatief',
    actionContext: 'key',    
    actionType: 'edit',
    editEl: 'qti-simple-choice',
    prompt: {
      text: (props: any) => `
      ${prop(props.sourceText, 'Gegeven deze multiple choice vraag: <slot>')} 
      ${prop(props.editValue, 'Vervang deze antwoordoptie door een andere antwoordoptie aansluitend bij de tekst (die nog niet in een andere <qti-simple-choice> staat): "<slot>".', 'Geef een nieuwe antwoordoptie.')}
      Geef de response terug in QTI formaat (qti-simple-choice), zoals in dit voorbeeld: <qti-simple-choice identifier="X">Antwoord X</qti-simple-choice>`
    }
  },
  {
    id: 'change-question-to-open',
    title: 'Verander naar open vraag',
    actionContext: 'key',    
    actionType: 'edit',
    editEl: 'qti-choice-interaction',
    prompt: {
      text: (props: any) => `
      ${prop(props.editValue, 'Gegeven deze multiple choice vraag: "<slot>".')}
        Maak van deze vraag een open vraag.
        Geef de response terug in QTI formaat (qti-extended-text-interaction), zoals in dit voorbeeld: 
        <qti-extended-text-interaction response-identifier="RESPONSE" expected-length="200">
          <qti-prompt>Vertel wat over de Romeinen.</qti-prompt>
        </qti-extended-text-interaction>`
    }
  },
  // {
  //   id: 'change-question-to-gap-match',
  //   title: 'Gap match',
  //   actionContext: 'key',    
  //   actionType: 'edit',
  //   editEl: 'qti-choice-interaction',
  //   prompt: {
  //     maxTokens: 2000,
  //     text: (props: any) => `
  //     ${prop(props.editValue, 'Gegeven deze multiple choice vraag: "<slot>".')}
  //       Maak van deze vraag een gap-match item. Zorg dat er meerdere gaps zijn en lopende tekst.
  //       Geef de response terug in QTI formaat (qti-gap-match-interaction), zoals in dit voorbeeld:         
  //       <qti-gap-match-interaction 
  //       class="qti-choices-bottom"
  //       response-identifier="RESPONSE" shuffle="false">
  //         <qti-gap-text identifier="W" match-max="1">winter</qti-gap-text>
  //         <qti-gap-text identifier="Sp" match-max="1">spring</qti-gap-text>
  //         <qti-gap-text identifier="Su" match-max="1">summer</qti-gap-text>
  //         <qti-gap-text identifier="A" match-max="1">autumn</qti-gap-text>
  //         <blockquote>
  //           <p>
  //             Now is the <qti-gap identifier="G1"/> of our discontent<br/>
  //             Made glorious <qti-gap identifier="G2"/> by this sun of York;<br/>
  //             And all the clouds that lour'd upon our house<br/>
  //             In the deep bosom of the ocean buried.
  //           </p>
  //         </blockquote>
  //       </qti-gap-match-interaction>`
  //   }
  // },
  //Generate...
  {
    id: 'source-text',
    title: 'Brontekst',
    actionContext: 'key',
    icon: 'text.png',
    prompt: {
      maxTokens: 1000,
      text: (props: any) => `
        Schrijf een brontekst (rond de 100 woorden) voor een examen. Gebruik een leuke context uit het dagelijks leven. Geef echt alleen de tekst terug. Geen vragen of heel examen.
       ${prop(props.course, 'Voor het vak <slot>.')}
       ${prop(props.level, 'Voor het niveau <slot>.')}       
       ${prop(props.description, 'Gebruik het volgende in de tekst: <slot>')}`,
      textProps: [
        { id: 'course', type: 'dropdown', title: 'Vak', values: ['Rekenen', 'Taal', 'Biologie', 'Duits', 'Nederlands', 'Scheikunde', 'Natuurkunde', 'Wiskunde'] },
        { id: 'level', type: 'dropdown', title: 'Niveau', values: ['groep 7', 'groep 8', 'VMBO BB', 'VMBO KB', 'HAVO', 'VWO'] },
        { id: 'description', type: 'textarea', placeholder: 'Omschrijf de tekst met trefwoorden, een tekst uit de syllabus, etc', title: 'Omschrijving' }
      ]
    },
    followUpPrompts: [
      { title: 'korter', text: () => 'Maak de tekst korter.' },
      { title: 'langer', text: () => 'Maak de tekst langer.' },
      {
        title: 'simpeler',
        text: () => 'De taal (zinsbouw en woordgebruik) is veel te moeilijk voor dit niveau. Maak het wat eenvoudiger.'
      },
      {
        title: 'creatiever',
        text: () =>
          "Probeer eens wat creatiever te zijn, niet zo'n standaard, maar een meer hedendaagse context zodat het meer bij de beleving van de doelgroep past."
      },
      { title: 'andere suggestie', text: () => 'Ik wil een hele andere tekst.' }
    ]
  },
  {
    id: 'question-open',
    title: 'Open vraag',
    actionContext: 'key',
    icon: 'open-question.png',
    followUpActions: [
      {
        id: 'question-open-source',
        title: 'basis van context',
        actionContext: 'follow-up',
        prompt: {
          maxTokens: 1000,
          text: (props: any) => `Maak een open examenvraag. 
           ${prop(props.sourceText, 'De vraag moet gaan over deze brontekst: <slot>')}
              Geef de response terug in QTI formaat (qti-extended-text-interaction), zoals in dit voorbeeld: 
              <qti-extended-text-interaction response-identifier="RESPONSE" expected-length="200">
                <qti-prompt>Vertel wat over de Romeinen.</qti-prompt>
              </qti-extended-text-interaction>`
        }
      },
      {
        id: 'question-open-free',
        title: 'basis van info',
        actionContext: 'follow-up',
        prompt: {
          maxTokens: 2000,
          text: (props: any) => `Maak een open examenvraag. 
          ${prop(props.course, 'Voor het vak <slot>.')}
          ${prop(props.level, 'Voor het niveau <slot>.')}       
          ${prop(props.description, 'Gebruik ook dit in de vraag: <slot>')}
              Geef de response terug in QTI formaat (qti-extended-text-interaction), zoals in dit voorbeeld: 
              <qti-extended-text-interaction response-identifier="RESPONSE" expected-length="200">
              <qti-prompt>Vertel wat over de Romeinen.</qti-prompt>
            </qti-extended-text-interaction>`,
          textProps: [
            { id: 'course', type: 'dropdown', title: 'Vak', values: ['Rekenen', 'Taal', 'Biologie', 'Duits', 'Nederlands', 'Scheikunde', 'Natuurkunde', 'Wiskunde'] },
            { id: 'level', type: 'dropdown', title: 'Niveau', values: ['groep 7', 'groep 8', 'VMBO BB', 'VMBO KB', 'HAVO', 'VWO'] },
            { id: 'description', type: 'textarea', placeholder: 'Omschrijf het item met trefwoorden, een tekst uit de syllabus, etc', title: 'Omschrijving' }
          ]
        }
      }
    ]
  },
  {
    id: 'question-multiple-choice',
    title: 'Multiple choice vraag',
    actionContext: 'key',
    icon: 'mc-question.png',
    followUpActions: [
      {
        id: 'question-multiple-choice-source',
        title: 'basis van context',
        actionContext: 'follow-up',
        prompt: {
          maxTokens: 1000,
          text: (props: any) => `Maak een multiple choice examenvraag.
           ${prop(props.sourceText, 'De vraag moet gaan over deze brontekst: <slot>')}
           Geef de response terug in QTI formaat (qti-choice-interaction), 
           zoals in dit voorbeeld: 
           <qti-choice-interaction id="choiceInteraction1" max-choices="1" shuffle="false" response-identifier="RESPONSE">
            <qti-prompt>Hier komt de vraag</qti-prompt>
            <qti-simple-choice identifier="A">Antwoord A</qti-simple-choice>
            <qti-simple-choice identifier="B">Antwoord B</qti-simple-choice>
            <qti-simple-choice identifier="C">Antwoord C</qti-simple-choice>
            <qti-simple-choice identifier="D">Antwoord D</qti-simple-choice>
          </qti-choice-interaction>`
        }
      },
      {
        id: 'question-multiple-choice-free',
        title: 'basis van info',
        actionContext: 'follow-up',
        prompt: {
          maxTokens: 2000,
          text: (props: any) => `Maak een multiple choice examenvraag.
          ${prop(props.course, 'Voor het vak <slot>.')}
          ${prop(props.level, 'Voor het niveau <slot>.')}       
          ${prop(props.description, 'Gebruik ook dit in de vraag: <slot>')}
          Geef de response terug in QTI formaat (qti-choice-interaction), 
          zoals in dit voorbeeld: 
          <qti-choice-interaction id="choiceInteraction1" max-choices="1" shuffle="false" response-identifier="RESPONSE">
           <qti-prompt>Hier komt de vraag</qti-prompt>
           <qti-simple-choice identifier="A">Antwoord A</qti-simple-choice>
           <qti-simple-choice identifier="B">Antwoord B</qti-simple-choice>
           <qti-simple-choice identifier="C">Antwoord C</qti-simple-choice>
           <qti-simple-choice identifier="D">Antwoord D</qti-simple-choice>
         </qti-choice-interaction>`,
          textProps: [
            { id: 'course', type: 'dropdown', title: 'Vak', values: ['Rekenen', 'Taal', 'Biologie', 'Duits', 'Nederlands', 'Scheikunde', 'Natuurkunde', 'Wiskunde'] },
            { id: 'level', type: 'dropdown', title: 'Niveau', values: ['groep 7', 'groep 8', 'VMBO BB', 'VMBO KB', 'HAVO', 'VWO'] },
            { id: 'description', type: 'textarea', placeholder: 'Omschrijf het item met trefwoorden, een tekst uit de syllabus, etc', title: 'Omschrijving' }
          ]
        }
      }
    ]
  },
  {
    id: 'image',
    title: 'Afbeelding',
    actionContext: 'key',
    followUpActions:[
      {
        id: 'image-source',
        title: 'basis van context',
        actionContext: 'follow-up',
        prompt: {
          promptType: 'image',
          text: (props: any) => `Genereer een afbeelding. Ik wil geen gegenereerde tekst in de afbeelding. 
          ${prop(props.sourceText, 'De afbeelding moet te maken hebben met: <slot>')}`
        }
      },
      {
        id: 'image-description',
        title: 'basis van omschrijving',
        actionContext: 'follow-up',
        prompt: {
          promptType: 'image',
          text: (props: any) => `${prop(props.description, '<slot>')}`,
          textProps: [
            { id: 'description', type: 'textarea', placeholder: 'Omschrijf de afbeelding, wees zo specifiek mogelijk', title: 'Omschrijving' }
          ]
        }
      }
    ]
  }
  // {
  //   id: 'image',
  //   title: 'Genereer afbeelding',
  //   actionContext: 'key',
  //   icon: 'image.png',
  //   prompt: {
  //     nrOptions: 3,
  //     text: (props: any) => `${props.question}. Ik wil geen gegenereerde tekst in de afbeelding.`
  //   }
  // },
  //Adjust selection...
  // {
  //   id: 'image',
  //   title: 'Genereer afbeelding',
  //   actionContext: 'selection',
  //   icon: 'image.png',
  //   prompt: {
  //     promptType: 'image',
  //     text: (props: any) => `${props.selection}`
  //   }
  // },
  // {
  //   id: 'easier',
  //   title: 'Maak taal simpeler',
  //   actionContext: 'selection',
  //   icon: 'think.png',
  //   prompt: {
  //     promptType: 'text',
  //     text: (props: any) => `gebruik eenvoudigere woorden: ${props.selection}`
  //   }
  // },
  // {
  //   id: 'harder',
  //   title: 'Maak taal moeilijker',
  //   actionContext: 'selection',
  //   icon: 'nerd.png',
  //   prompt: {
  //     promptType: 'text',
  //     text: (props: any) => `gebruik moeilijkere woorden: ${props.selection}`
  //   }
  // },
  // {
  //   id: 'synonym',
  //   title: 'Synoniem',
  //   actionContext: 'selection',
  //   prompt: {
  //     promptType: 'text',
  //     nrOptions: 3,
  //     text: (props: any) => `mag ik een synoniem voor dit woord: ${props.selection}. geef alleen het synoniem`,
  //   },
  // },
  // {
  //   id: 'alternative',
  //   title: 'Alternatief',
  //   actionContext: 'selection',
  //   icon: 'redo.png',
  //   prompt: {
  //     promptType: 'text',
  //     nrOptions: 3,
  //     text: (props: any) =>
  //       `Gegeven de vraag: ${props.question}. Mag ik een alternatieve optie voor: ${props.selection}? Gebruik niet een van de andere opties. En geeft gewoon het alternatief, niet een hele zin eromheen.`
  //   }
  // },
  //Tweak suggestion...
  // {
  //   id: 'make-shorter',
  //   title: 'Maak korter',
  //   actionContext: 'edit-suggestion',
  //   icon: 'smaller.png',
  //   prompt: {
  //     promptType: 'text',
  //     text: () => 'Maak korter, wat kortere zinnen en 1 of 2 zinnen minder.'
  //   }
  // },
  // {
  //   id: 'make-longer',
  //   title: 'Maak langer',
  //   actionContext: 'edit-suggestion',
  //   icon: 'expand.png',
  //   prompt: {
  //     promptType: 'text',
  //     text: () => 'Maak langer, voeg wat (meer) context toe bijvoorbeeld'
  //   }
  // },
  // {
  //   id: 'correction',
  //   title: 'Correctie grammatica/spelling',
  //   actionContext: 'edit-suggestion',
  //   icon: 'eyebrows.png',
  //   prompt: {
  //     promptType: 'text',
  //     text: () => 'Dit is geen correct Nederlands, zoek de fouten en verbeter'
  //   }
  // },
  // {
  //   id: 'easier',
  //   title: 'Simpeler',
  //   actionContext: 'edit-suggestion',
  //   icon: 'think.png',
  //   prompt: {
  //     promptType: 'text',
  //     text: () => 'De taal (zinsbouw en woordgebruik) is veel te moeilijk voor dit niveau. Maak het wat eenvoudiger'
  //   }
  // },
  // {
  //   id: 'harder',
  //   title: 'Moeilijker',
  //   actionContext: 'edit-suggestion',
  //   icon: 'nerd.png',
  //   prompt: {
  //     promptType: 'text',
  //     text: () => 'De taal (zinsbouw en woordgebruik) is veel te makkelijk voor dit niveau. Maak het wat moeilijker'
  //   }
  // },
  // {
  //   id: 'creative',
  //   title: 'Creatiever',
  //   actionContext: 'edit-suggestion',
  //   icon: 'confetti.png',
  //   prompt: {
  //     promptType: 'text',
  //     text: () =>
  //       "Probeer eens wat creatiever te zijn, niet zo'n standaard, maar een meer hedendaagse context zodat het meer bij de beleving van de doelgroep past."
  //   }
  // },
  // {
  //   id: 'again',
  //   title: 'Andere suggestie',
  //   actionContext: 'edit-suggestion',
  //   icon: 'redo.png',
  //   prompt: {
  //     promptType: 'text',
  //     text: () => 'Nog een andere suggestie.'
  //   }
  // },
  // {
  //   id: 'check-all',
  //   title: 'Constructieregels',
  //   actionContext: 'rules',
  //   prompt: {
  //     promptType: 'rules',
  //     text: props => `De volgende vraag is gegeven: ${props.question}:
  //     Je bent toetsexpert. Als de vraag en antwoordopties voldoen aan de volgende constructieregel zeg dan 'SUPER'? ${props.rule}
  //     Als dat niet het geval is geef een verbetersuggestie.`
  //   }
  // }
  //rules checker
  // {
  //   id: 'choice-order',
  //   title: 'Controleer volgorde van antwoordopties',
  //   actionContext: 'rules',
  //   prompt: {
  //     promptType: 'text',
  //     text: (props) => `${props.question}: Zet de antwoordopties van de volgende vraag in een logische volgorde.`
  //   }
  // },
  // {
  //   id: 'stam-herhaling',
  //   title: 'Controleer of er geen onnodige herhaling van de stam is',
  //   actionContext: 'rules',
  //   prompt: {
  //     promptType: 'text',
  //     text: (props) => `De volgende vraag is gegeven: ${props.question}
  //     Controleer de vraag.
  //     Staat in de antwoordopties een onnodige herhaling van (een deel van) een zin die ook al in de vraag staat? Geef een verbetersuggestie`
  //   }
  // },
  // {
  //   id: 'choice-length',
  //   title: 'Zorg ervoor dat de antwoordopties ongeveer even lang zijn ',
  //   actionContext: 'rules',
  //   prompt: {
  //     promptType: 'text',
  //     text: (props) => `De volgende examenvraag is gegeven: ${props.question}
  //     Controleer of de antwoordopties even lang zijn. Even lang is max 15% verschil in aantal leestekens. Geef alleen de verbetersuggestie terug`
  //   }
  // },
  // {
  //   id: 'double-negation',
  //   title: 'Gebruik geen dubbele ontkenningen',
  //   actionContext: 'rules',
  //   prompt: {
  //     promptType: 'text',
  //     text: (props) => `De volgende examenvraag is gegeven: ${props.question}
  //     Controleer de vraag entekst. Zit er een dubbele ontkenning in de tekst, vraag of in de antwoordopties? Zo ja, geef een verbetersuggestie.`
  //   }
  // }
];

//Get text if prop exists
const prop = (prop: string, text: string, alt?: string) => {  
  return prop ? text.replace('<slot>', prop) : alt ?? '';
};

export const constructionRules = [
  `Er mag geen ontkenning in de vraag staan.`,
  `De juiste antwoordoptie mag niet direct opvallen door de manier van formuleren.`,
  `De antwoordopties moeten in een logische volgorde staan (meestal alfabetisch).`,
  `De antwoordopties mogen niet ‘geen van bovenstaande antwoorden’, ‘alle antwoorden zijn juist’, of iets wat daar op lijkt zijn.`,
  `De vraag mag niet uit nodeloos lange zinnen bestaan.`,
  `In de antwoordopties mag niet een onnodige herhaling van (een deel van) een zin die ook al in de vraag staan.`,
  `In de vraag of antwoordopties mag geen dubbele ontkenning staan.`,
  `In de vraag of antwoordopties mag geen absolutisme staan.`,
  `De antwoordopties moeten dezelfde lengte hebben.`,
  `De antwoordopties moeten dezelfde zinsbouw hebben.`,
  `De antwoordopties moeten consistent zijn.`,
  `Er mag geen overbodige informatie in de vraag staan.`
];

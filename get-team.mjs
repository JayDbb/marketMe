import { LinearClient } from '@linear/sdk'

const linearClient = new LinearClient({ apiKey: 'lin_api_y11VZmVZC8FqoanfYODyhGAYZsQzP6BO2JtP99pi' })

async function getTeams() {
  const teams = await linearClient.teams()
  if (teams.nodes.length) {
    console.log(teams.nodes.map(t => `${t.name}: ${t.id}`).join('\n'))
  } else {
    console.log('No teams found')
  }
}

getTeams().catch(console.error)

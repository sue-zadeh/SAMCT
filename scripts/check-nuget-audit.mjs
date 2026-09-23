import { readFile } from 'node:fs/promises'
const report = JSON.parse(await readFile(process.argv[2], 'utf8'))
if (report.problems?.length) throw new Error('NuGet audit could not complete; review the audit output.')
const packages = (report.projects || []).flatMap(project => project.frameworks || []).flatMap(framework => [...(framework.topLevelPackages || []), ...(framework.transitivePackages || [])])
if (packages.some(item => item.vulnerabilities?.length)) throw new Error('Known vulnerable NuGet packages found; review the audit output.')
console.log('No known vulnerable NuGet packages reported.')

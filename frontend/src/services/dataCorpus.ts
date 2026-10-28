import { ResearchPaper, DeepAnalysisResult, AIBadge, PICOSpan } from '../types';

// Pre-computed high-yield medical dataset on GLP-1 Receptor Agonists in Mild Cognitive Impairment & Early Alzheimer's Disease
// Contains a rich corpus designed to scale seamlessly to 1000+ papers
export function generateLargeCorpus(targetCount: number = 1050): ResearchPaper[] {
  const seedStudies: Array<{
    title: string;
    abstract: string;
    authors: string[];
    year: number;
    journal: string;
    pmid: string;
    doi: string;
    isRCT: boolean;
    sampleSize: number;
    effectMetric: string;
    pValue: number;
    hasSafetySignal: boolean;
    isContradictory: boolean;
    hasBiomarker: boolean;
    isAnimal: boolean;
    isNonEnglish: boolean;
    isSimulation: boolean;
    isCaseReport: boolean;
  }> = [
    {
      title: "Evaluation of Daily Oral Semaglutide on Cognitive Decline in Early Alzheimer's Disease: The EVOKE Randomized Phase 3 Trial",
      abstract: "Background: Glucagon-like peptide-1 receptor agonists exhibit neuroprotective and anti-inflammatory properties in preclinical models. Methods: In this double-blind, randomized, placebo-controlled phase 3 trial across 142 centers, 1,842 patients with early-stage Alzheimer's disease (CDR 0.5-1.0) were assigned to receive oral semaglutide (escalated to 14 mg daily) or matching placebo for 104 weeks. The primary endpoint was change from baseline in the Clinical Dementia Rating-Sum of Boxes (CDR-SB) score. Results: Oral semaglutide significantly reduced CDR-SB progression by 26% compared with placebo (mean difference -0.74, 95% CI -1.12 to -0.36; p=0.0012). Key secondary endpoints showed preservation of hippocampal volume on 3T MRI and reduced plasma phosphorylated-tau181 levels (p<0.001). Adverse events were predominantly mild-to-moderate transient gastrointestinal events (nausea 18.4% vs 6.1%). Conclusion: Semaglutide demonstrated statistically significant slowing of clinical cognitive decline and biomarker stabilization in early Alzheimer's disease.",
      authors: ["Cummings, J.", "Aisen, P.", "Vellas, B.", "Salloway, S.", "Scheltens, P."],
      year: 2024,
      journal: "New England Journal of Medicine",
      pmid: "38901244",
      doi: "10.1056/NEJMoa2401892",
      isRCT: true,
      sampleSize: 1842,
      effectMetric: "HR 0.74 (95% CI 0.62-0.88), CDR-SB Δ -0.74",
      pValue: 0.0012,
      hasSafetySignal: false,
      isContradictory: false,
      hasBiomarker: true,
      isAnimal: false,
      isNonEnglish: false,
      isSimulation: false,
      isCaseReport: false,
    },
    {
      title: "Liraglutide as a Neuroprotective Agent in Mild Cognitive Impairment: The ELAD Multicentre, Double-Blind, Placebo-Controlled Trial",
      abstract: "Background: Insulin desensitization in the cerebral cortex is implicated in Alzheimer's pathogenesis. Methods: The ELAD trial enrolled 204 participants with mild cognitive impairment or mild Alzheimer's dementia across 20 UK hospitals. Participants were randomized to receive subcutaneous liraglutide (1.8 mg daily) or placebo for 12 months. Primary cognitive outcome was the change in cerebral glucose metabolic rate (CMRglu) measured by 18F-FDG PET in cortical regions. Secondary endpoints included ADAS-Cog-13 score and total brain volume. Results: At 12 months, the primary endpoint CMRglu did not differ significantly between groups (p=0.42). However, MRI volumetric analysis demonstrated a significant 50% reduction in temporal lobe atrophy in the liraglutide cohort compared to placebo (p=0.024). ADAS-Cog scores showed a favorable trend (-1.8 points favoring liraglutide, p=0.06). Conclusion: Although primary cortical metabolic rate did not change, liraglutide showed structural neuroprotective effects by attenuating cerebral atrophy.",
      authors: ["Edison, P.", "Femminella, G. D.", "Ritchie, C. W.", "Holmes, C.", "Ballard, C."],
      year: 2023,
      journal: "The Lancet Neurology",
      pmid: "37423891",
      doi: "10.1016/S1474-4422(23)00198-4",
      isRCT: true,
      sampleSize: 204,
      effectMetric: "Brain Atrophy Attenuation 50%, ADAS-Cog Δ -1.8",
      pValue: 0.024,
      hasSafetySignal: false,
      isContradictory: false,
      hasBiomarker: true,
      isAnimal: false,
      isNonEnglish: false,
      isSimulation: false,
      isCaseReport: false,
    },
    {
      title: "Lack of Cognitive Benefit with GLP-1 Receptor Agonist Exenatide in Moderate Alzheimer's Disease: A 24-Week Randomized Study",
      abstract: "Objective: To assess whether subcutaneous exenatide improves cognitive performance in moderate-stage Alzheimer's disease. Methods: In a double-blind trial, 78 patients with moderate Alzheimer's dementia (MMSE 14-20) were randomized to exenatide 10 mcg twice daily or placebo for 24 weeks. Primary outcome was change in ADAS-Cog score. Results: No statistically significant difference in ADAS-Cog scores was observed between exenatide and placebo groups (+0.4 vs +0.6 points, p=0.78). Plasma amyloid-beta and tau ratios remained unaltered. Treatment was associated with high rates of nausea (34%) and weight loss (>5% body weight in 22% of participants). Conclusion: Exenatide did not alter cognitive decline or plasma biomarkers in moderate Alzheimer's disease over 24 weeks, suggesting therapeutic efficacy may be restricted to early presymptomatic stages or is compound-specific.",
      authors: ["Mullins, R. J.", "Mustapic, M.", "Chu, D.", "Chia, C. W.", "Kapogiannis, D."],
      year: 2022,
      journal: "Neurology",
      pmid: "35115390",
      doi: "10.1212/WNL.0000000000013280",
      isRCT: true,
      sampleSize: 78,
      effectMetric: "ADAS-Cog Δ +0.2 (no significant difference)",
      pValue: 0.78,
      hasSafetySignal: true,
      isContradictory: true,
      hasBiomarker: false,
      isAnimal: false,
      isNonEnglish: false,
      isSimulation: false,
      isCaseReport: false,
    },
    {
      title: "Real-World Incident Dementia Risk in 120,000 Older Adults Treated with GLP-1 Receptor Agonists vs DPP-4 Inhibitors",
      abstract: "Importance: Preclinical and registry observations suggest incretin mimetics mitigate neurodegeneration. Objective: To evaluate whether GLP-1 receptor agonist initiation is associated with reduced incidence of dementia compared with DPP-4 inhibitors in a nationwide cohort. Design and Participants: Retrospective target trial emulation of 124,518 adults aged 65 and older without baseline dementia followed for up to 8 years. Exposure: New-user active-comparator design matching GLP-1 RA users 1:1 with DPP-4 inhibitor users on high-dimensional propensity scores. Main Outcomes: Incident all-cause dementia and Alzheimer's disease. Results: Over 380,000 person-years of follow-up, GLP-1 RA users experienced a lower hazard of incident dementia compared with DPP-4 inhibitor users (adjusted HR 0.77, 95% CI 0.69-0.85, p<0.0001). Subgroup analysis indicated strongest risk reduction for semaglutide (HR 0.68, 95% CI 0.56-0.81). Conclusion: In this massive real-world cohort, GLP-1 RA initiation was associated with a 23% reduction in dementia risk.",
      authors: ["Wium-Andersen, I. K.", "Osler, M.", "Jorgensen, M. B.", "Wium-Andersen, M. K."],
      year: 2024,
      journal: "JAMA Internal Medicine",
      pmid: "38345719",
      doi: "10.1001/jamainternmed.2023.7745",
      isRCT: false,
      sampleSize: 124518,
      effectMetric: "HR 0.77 (95% CI 0.69-0.85)",
      pValue: 0.0001,
      hasSafetySignal: false,
      isContradictory: false,
      hasBiomarker: false,
      isAnimal: false,
      isNonEnglish: false,
      isSimulation: false,
      isCaseReport: false,
    },
    {
      title: "Chronic semaglutide treatment alleviates microglial neuroinflammation and restores synaptic density in APP/PS1 transgenic mice",
      abstract: "The gut-brain axis plays a critical role in neurodegenerative pathology. Here, we examined the effects of daily subcutaneous semaglutide (25 nmol/kg) in 9-month-old male APP/PS1 transgenic mice. Behavioral assessments via the Morris water maze revealed marked improvements in spatial memory retention (escape latency reduced by 44%, p<0.01). Immunohistochemical analysis demonstrated a 52% reduction in cortical amyloid-beta plaque load and diminished Iba-1 microglial activation. Golgi-Cox staining revealed preserved dendritic spine density in hippocampal CA1 pyramidal neurons. These preclinical murine findings confirm that semaglutide crosses the blood-brain barrier to exert direct neuroprotection.",
      authors: ["Zhang, L.", "Zhang, J.", "Sun, X.", "Gao, L."],
      year: 2023,
      journal: "Neurobiology of Aging",
      pmid: "37210944",
      doi: "10.1016/j.neurobiolaging.2023.04.011",
      isRCT: false,
      sampleSize: 48,
      effectMetric: "Plaque reduction 52%, Latency reduction 44%",
      pValue: 0.008,
      hasSafetySignal: false,
      isContradictory: false,
      hasBiomarker: true,
      isAnimal: true, // EXCLUDE: ANIMAL
      isNonEnglish: false,
      isSimulation: false,
      isCaseReport: false,
    },
    {
      title: "Effets des agonistes des récepteurs du GLP-1 sur le déclin cognitif dans une cohorte francophone de démence débutante",
      abstract: "Objectif: Évaluer l'impact des analogues du GLP-1 chez les patients atteints de troubles cognitifs légers dans une cohorte clinique en France. Méthodes: Étude observationnelle rétrospective sur 112 patients âgés de 60 à 80 ans suivis pendant 18 mois en centre mémoire. Résultats: Le score MMS moyen est resté stable chez les patients traités (24.1 vs 23.8, p=0.45). Les marqueurs plasmatiques de neurodégénérescence n'ont pas montré de modification statistiquement significative. Conclusion: Les agonistes du GLP-1 semblent bien tolérés chez les personnes âgées mais nécessitent des essais prospectifs randomisés.",
      authors: ["Dubois, B.", "Pasquier, F.", "Sarazin, M.", "Lehericy, S."],
      year: 2023,
      journal: "Revue Neurologique (Paris)",
      pmid: "37890123",
      doi: "10.1016/j.neurol.2023.08.004",
      isRCT: false,
      sampleSize: 112,
      effectMetric: "MMS Δ -0.3 (non significatif)",
      pValue: 0.45,
      hasSafetySignal: false,
      isContradictory: false,
      hasBiomarker: false,
      isAnimal: false,
      isNonEnglish: true, // EXCLUDE: NON-ENGLISH
      isSimulation: false,
      isCaseReport: false,
    },
    {
      title: "Molecular Dynamics and In Silico Docking Analysis of GLP-1 Receptor Agonists Binding to Human Tau Microtubule-Binding Repeat Domains",
      abstract: "Hyperphosphorylated tau aggregates represent a central hallmark of Alzheimer's pathology. In this computational investigation, we performed molecular dynamics simulations (500 ns) and blind docking calculations to model the binding thermodynamics of semaglutide, tirzepatide, and liraglutide with tau repeat domain R2-R3 (PDB: 5O3L). Free energy calculations using MM-PBSA identified favorable electrostatic and van der Waals interactions (-48.2 kcal/mol for semaglutide). These virtual screening simulations hypothesize a direct conformational stabilization of tau monomeric states.",
      authors: ["Bhattacharya, S.", "Kulkarni, R.", "Sharma, P."],
      year: 2024,
      journal: "Journal of Chemical Information and Modeling",
      pmid: "38450122",
      doi: "10.1021/acs.jcim.4c00219",
      isRCT: false,
      sampleSize: 0,
      effectMetric: "Binding energy -48.2 kcal/mol",
      pValue: 0.05,
      hasSafetySignal: false,
      isContradictory: false,
      hasBiomarker: false,
      isAnimal: false,
      isNonEnglish: false,
      isSimulation: true, // EXCLUDE: SIMULATION
      isCaseReport: false,
    },
    {
      title: "Rapid Reversal of Cognitive Fluctuations Following Semaglutide Initiation in an 81-Year-Old Patient with Cerebral Amyloid Angiopathy: A Case Report",
      abstract: "We report the case of an 81-year-old female with diagnosed cerebral amyloid angiopathy and progressive executive dysfunction who initiated subcutaneous semaglutide 0.5 mg weekly for secondary metabolic indications. Within eight weeks of treatment initiation, serial Montreal Cognitive Assessment (MoCA) scores improved from 19/30 to 24/30, accompanied by resolution of daytime disorientation and improved gait stability. While encouraging, single-patient clinical observations cannot establish causality and require formal randomized clinical testing.",
      authors: ["Vanderbilt, E.", "Mercer, T."],
      year: 2023,
      journal: "BMJ Case Reports",
      pmid: "36994102",
      doi: "10.1136/bcr-2023-255019",
      isRCT: false,
      sampleSize: 1,
      effectMetric: "MoCA score +5 points",
      pValue: 0.05,
      hasSafetySignal: false,
      isContradictory: false,
      hasBiomarker: false,
      isAnimal: false,
      isNonEnglish: false,
      isSimulation: false,
      isCaseReport: true, // EXCLUDE: CASE REPORT
    },
    {
      title: "Gastrointestinal Intolerance and High Discontinuation Rates of High-Dose GLP-1 Receptor Agonists in Frail Older Adults with Neurodegenerative Disorders",
      abstract: "Background: High-dose incretin mimetics are increasingly investigated for central nervous system indications. Methods: In an open-label safety cohort of 165 community-dwelling frail older adults (mean age 79.4 years) with mild dementia initiated on dulaglutide or semaglutide, treatment tolerability was monitored over 36 weeks. Results: Thirty-four patients (20.6%) discontinued therapy permanently due to severe nausea, persistent vomiting, or dehydration requiring acute medical evaluation. Sarcopenic muscle mass loss exceeding 3.5 kg was detected in 18% of participants. Neuropsychological scores showed no net cognitive divergence from non-treated controls. Conclusion: High-dose GLP-1 receptor agonist therapy in frail elderly patients with cognitive impairment carries substantial tolerability risks that may limit clinical utility.",
      authors: ["Schulz, M.", "Kaufmann, T.", "Richter, B.", "Wagner, H."],
      year: 2023,
      journal: "Drugs & Aging",
      pmid: "37561928",
      doi: "10.1007/s40266-023-01048-2",
      isRCT: false,
      sampleSize: 165,
      effectMetric: "Discontinuation rate 20.6%, Sarcopenia 18%",
      pValue: 0.004,
      hasSafetySignal: true, // SAFETY SIGNAL
      isContradictory: true,
      hasBiomarker: false,
      isAnimal: false,
      isNonEnglish: false,
      isSimulation: false,
      isCaseReport: false,
    },
    {
      title: "Dual GLP-1/GIP Receptor Co-Agonist Tirzepatide Slows Tau Phosphorylation and Preserves White Matter Integrity in Pre-Dementia",
      abstract: "Background: Dual incretin receptor co-agonists stimulate both GLP-1 and glucose-dependent insulinotropic polypeptide receptors. Methods: In an exploratory 48-week randomized clinical trial, 120 patients aged 60-75 with amnestic mild cognitive impairment and positive amyloid PET were assigned to tirzepatide (5 mg or 10 mg weekly) or placebo. Endpoints included changes in plasma p-tau217, neurofilament light chain (NfL), and diffusion tensor imaging (DTI) fractional anisotropy of the corpus callosum. Results: Tirzepatide treatment resulted in a 31% reduction in plasma p-tau217 compared with placebo (p=0.003) and preserved white matter fractional anisotropy (p=0.018). Mean ADAS-Cog-13 showed stable performance in the 10 mg arm (+0.1 vs +2.3 in placebo, p=0.035). Conclusion: Dual GLP-1/GIP receptor agonism demonstrates promising biological disease-modifying activity and neuroprotection in early amnestic impairment.",
      authors: ["Hampel, H.", "Vergallo, A.", "Caraci, F.", "Caramelli, P."],
      year: 2024,
      journal: "Alzheimer's & Dementia",
      pmid: "38671044",
      doi: "10.1002/alz.13892",
      isRCT: true,
      sampleSize: 120,
      effectMetric: "p-tau217 reduction 31%, ADAS-Cog Δ -2.2",
      pValue: 0.003,
      hasSafetySignal: false,
      isContradictory: false,
      hasBiomarker: true,
      isAnimal: false,
      isNonEnglish: false,
      isSimulation: false,
      isCaseReport: false,
    }
  ];

  // Variations for generating 1000+ realistic systematically diverse papers
  const authorsList = [
    ["Cummings, J.", "Aisen, P.", "Vellas, B."],
    ["Edison, P.", "Femminella, G. D.", "Ballard, C."],
    ["Hampel, H.", "Vergallo, A.", "Caraci, F."],
    ["Salloway, S.", "Scheltens, P.", "Petersen, R."],
    ["Dubois, B.", "Blennow, K.", "Zetterberg, H."],
    ["Mintun, M. A.", "Lo, A. C.", "Evans, C. D."],
    ["van Dyck, C. H.", "Swanson, C. J.", "Arahata, Y."],
    ["Jack, C. R.", "Bennett, D. A.", "Holtzman, D. M."],
    ["Tanzi, R. E.", "Moir, R. D.", "Bertram, L."],
    ["Hardy, J.", "Selkoe, D. J.", "De Strooper, B."]
  ];

  const journals = [
    "New England Journal of Medicine",
    "The Lancet Neurology",
    "JAMA Neurology",
    "Alzheimer's & Dementia",
    "Brain",
    "Annals of Neurology",
    "Neurobiology of Disease",
    "Journal of Alzheimer's Disease",
    "Molecular Neurodegeneration",
    "Neurology",
    "Nature Medicine",
    "Acta Neuropathologica"
  ];

  const papers: ResearchPaper[] = [];

  // Seed baseline 10 papers first
  seedStudies.forEach((seed, idx) => {
    papers.push(createPaperFromSeed(seed, `paper-${idx + 1}`, '1', `grp-${idx + 1}`));
  });

  // Now create systematic duplicates to test Step 4 Deduplication
  // 1) Exact DOI duplicate of seed 0 (EVOKE Trial)
  papers.push({
    ...papers[0],
    id: 'paper-dup-1',
    queryVersionIds: ['2'],
    groupId: 'grp-1',
    isRepresentative: false,
    hidden: true,
    source: 'europe_pmc',
  });

  // 2) Fuzzy title duplicate without DOI of seed 1 (ELAD trial)
  papers.push({
    ...papers[1],
    id: 'paper-dup-2',
    doi: undefined,
    pmid: undefined,
    title: "Liraglutide as a neuroprotective agent in mild cognitive impairment the ELAD multicentre trial",
    queryVersionIds: ['2'],
    groupId: 'grp-2',
    isRepresentative: false,
    hidden: true,
    source: 'local_corpus',
  });

  // Expand to targetCount (default 1050 papers)
  const interventionMolecules = [
    "Semaglutide", "Liraglutide", "Dulaglutide", "Tirzepatide", 
    "Exenatide", "Lixisenatide", "Retatrutide", "CagriSema"
  ];

  const clinicalEndpoints = [
    "ADAS-Cog-13 cognitive decline velocity",
    "Clinical Dementia Rating-Sum of Boxes (CDR-SB)",
    "Montreal Cognitive Assessment (MoCA) score retention",
    "Mini-Mental State Examination (MMSE) trajectory",
    "Hippocampal volume preservation via 3T MRI",
    "Plasma phosphorylated tau (p-tau181 and p-tau217) suppression",
    "Cortical amyloid burden assessed by 18F-florbetapir PET",
    "Cerebrospinal fluid neurofilament light chain (NfL) dynamics"
  ];

  const studyPrototypes = [
    { type: 'rct', ratio: 0.35 },
    { type: 'observational', ratio: 0.30 },
    { type: 'animal', ratio: 0.15 },
    { type: 'simulation', ratio: 0.08 },
    { type: 'case_report', ratio: 0.07 },
    { type: 'non_english', ratio: 0.05 },
  ];

  let currentId = papers.length + 1;

  for (let i = papers.length; i < targetCount; i++) {
    const randomMolecule = interventionMolecules[i % interventionMolecules.length];
    const randomEndpoint = clinicalEndpoints[i % clinicalEndpoints.length];
    const authors = authorsList[i % authorsList.length];
    const journal = journals[i % journals.length];
    const year = 2018 + (i % 9); // 2018 to 2026

    // Determine type
    const roll = (i * 17 + 23) % 100;
    let isRCT = false;
    let isAnimal = false;
    let isSimulation = false;
    let isCaseReport = false;
    let isNonEnglish = false;
    let isContradictory = (i % 11 === 0);
    let sampleSize = 100 + ((i * 73) % 1200);

    if (roll < 35) {
      isRCT = true;
    } else if (roll < 65) {
      // Observational
      sampleSize = 400 + ((i * 137) % 8500);
    } else if (roll < 80) {
      isAnimal = true;
      sampleSize = 20 + (i % 60);
    } else if (roll < 88) {
      isSimulation = true;
      sampleSize = 0;
    } else if (roll < 95) {
      isCaseReport = true;
      sampleSize = 1;
    } else {
      isNonEnglish = true;
      sampleSize = 80 + (i % 200);
    }

    let title = "";
    let abstract = "";

    if (isAnimal) {
      title = `${randomMolecule} mitigates cortical tau phosphorylation and preserves spatial navigation in aged rodent models of neurodegeneration`;
      abstract = `Preclinical investigation evaluating subcutaneous ${randomMolecule} administration in 12-month-old Sprague-Dawley rats and murine models. Morris water maze assessments indicated significant improvements in platform crossing latency. Histological examination showed marked reduction in glial fibrillary acidic protein (GFAP) and cortical microgliosis. These findings suggest that ${randomMolecule} acts directly on murine cerebrovascular receptors to counter neuroinflammatory cascades.`;
    } else if (isSimulation) {
      title = `In silico molecular dynamics and allosteric conformational mapping of ${randomMolecule} with human central GLP-1 and GIP receptors`;
      abstract = `Computational atomic simulations investigating ligand-binding kinetics of ${randomMolecule} interacting with the transmembrane domain of human GLP-1 receptors. Molecular mechanics Generalized Born surface area (MM-GBSA) calculations yielded binding affinities of -54.6 kcal/mol. Root-mean-square deviation (RMSD) profiles stabilized over 300 ns simulations, confirming allosteric stabilization of the intracellular loop 3 docking groove.`;
    } else if (isCaseReport) {
      title = `Stabilization of rapidly progressive cognitive deterioration with ${randomMolecule} in an elderly patient: A clinical case study`;
      abstract = `We describe an 82-year-old male presenting with fluctuating cognitive impairment and atypical parkinsonism who demonstrated unexpected functional stabilization following 16 weeks of ${randomMolecule} therapy. MoCA score improved from 17 to 21. While mechanistic causality cannot be established from a single patient report, these findings warrant systematic randomized controlled trials.`;
    } else if (isNonEnglish) {
      title = `Bewertung der kognitiven Funktion unter ${randomMolecule} bei älteren Patienten mit leichter kognitiver Beeinträchtigung`;
      abstract = `Hintergrund: Inkretinglukosemimetika werden zunehmend auf neuroprotektive Wirkungen untersucht. Methoden: In einer monozentrischen Beobachtungsstudie an 86 Patienten in Berlin wurden kognitive Scores über 12 Monate dokumentiert. Ergebnisse: Es zeigte sich eine statistisch nicht signifikante Tendenz zur Stabilisierung des MMST-Wertes (p=0.18). Schlussfolgerung: Größere prospektive Studien sind erforderlich.`;
    } else if (isRCT) {
      if (isContradictory) {
        title = `A Randomized, Double-Blind Phase 2b Trial of ${randomMolecule} vs Placebo in Mild Alzheimer's Disease: Assessment of ${randomEndpoint}`;
        abstract = `Background: While GLP-1 receptor agonists show metabolic benefits, their efficacy in halting cognitive decline remains under debate. Methods: In this multi-center, double-blind randomized clinical trial, ${sampleSize} patients with mild Alzheimer's dementia received ${randomMolecule} or matching placebo for 52 weeks. The primary outcome was change in ${randomEndpoint}. Results: No statistically significant differences between ${randomMolecule} and placebo were detected at week 52 (mean difference +0.12, 95% CI -0.45 to +0.69; p=0.68). Biomarker endpoints showed no significant divergence. Conclusion: ${randomMolecule} failed to demonstrate disease-modifying cognitive benefit in this cohort.`;
      } else {
        title = `Efficacy of ${randomMolecule} on ${randomEndpoint} in Early Alzheimer's Disease: A Multicenter Randomized Controlled Trial`;
        abstract = `Background: Neuronal insulin signaling defects accelerate neurodegenerative progression in Alzheimer's disease. Methods: In this randomized, double-blind, placebo-controlled trial across 32 medical centers, ${sampleSize} participants with mild cognitive impairment or early Alzheimer's disease were allocated to receive ${randomMolecule} or matching placebo for 78 weeks. Results: Patients assigned to ${randomMolecule} exhibited significantly reduced cognitive decline as measured by ${randomEndpoint} (adjusted difference -0.68, 95% CI -1.05 to -0.31, p=0.0028). Neuroimaging demonstrated preserved cortical thickness in temporal and parietal regions. Gastrointestinal adverse events occurred in 14.8% of participants. Conclusion: ${randomMolecule} demonstrated significant cognitive preservation and structural neuroprotection in early Alzheimer's disease.`;
      }
    } else {
      title = `Longitudinal Real-World Association between ${randomMolecule} Exposure and ${randomEndpoint} in an Insured Population Cohort`;
      abstract = `Objective: To investigate whether exposure to ${randomMolecule} is associated with altered rate of ${randomEndpoint} in clinical practice. Design: Retrospective observational cohort study evaluating ${sampleSize} patients aged 60 and older over a median follow-up of 4.2 years. Results: High-dimensional propensity-score matching revealed that ${randomMolecule} treatment was associated with a favorable hazard ratio of 0.81 (95% CI 0.73-0.89, p=0.0004). Subgroup analyses confirmed consistent findings across baseline glycemic strata. Conclusion: Real-world evidence supports a protective association between ${randomMolecule} and cognitive decline.`;
    }

    const pValue = isContradictory ? 0.68 : (isSimulation ? 0.05 : 0.0028);
    const effectMetric = isContradictory 
      ? "Δ +0.12 (p=0.68, non-significant)" 
      : (isRCT ? "HR 0.72 (95% CI 0.60-0.86), p=0.0028" : "HR 0.81 (95% CI 0.73-0.89)");

    const pmid = `39${(100000 + i).toString()}`;
    const doi = `10.1016/j.neuro.${year}.${(1000 + i).toString()}`;
    const pId = `paper-${currentId}`;
    const gId = `grp-${currentId}`;

    const newPaper: ResearchPaper = {
      id: pId,
      title,
      abstract,
      authors,
      year,
      journal,
      pmid,
      doi,
      source: i % 2 === 0 ? 'pubmed' : 'europe_pmc',
      queryVersionIds: ['1'],
      groupId: gId,
      isRepresentative: true,
      hidden: false,
      language: isNonEnglish ? 'ger' : 'eng',
      publicationTypes: isRCT ? ['Randomized Controlled Trial', 'Clinical Trial'] : (isAnimal ? ['Preclinical Animal Study'] : ['Observational Study']),
      picoSpans: generateSpans(abstract, randomMolecule, randomEndpoint, isAnimal),
      aiBadges: generateBadges(isRCT, sampleSize, pValue, isContradictory, isAnimal, isSimulation, isCaseReport),
      deepAnalysis: {
        studyDesign: isRCT ? "Double-Blind Randomized Controlled Trial (Phase II/III)" : (isAnimal ? "Preclinical Animal Experiment" : "Prospective Observational Cohort"),
        sampleSize,
        dosageDuration: `${randomMolecule} maintenance dosing for 52-104 weeks`,
        primaryEffectMetric: effectMetric,
        pValue,
        confidenceInterval: isContradictory ? "95% CI -0.45 to +0.69" : "95% CI 0.60 to 0.86",
        endpointSummary: `${randomEndpoint} evaluated over longitudinal follow-up`,
        statisticalRigorScore: isRCT ? (sampleSize > 500 ? 94 : 86) : (isAnimal ? 42 : 72),
        biasAssessment: {
          riskLevel: isRCT ? 'Low' : (isAnimal || isSimulation || isCaseReport ? 'High' : 'Moderate'),
          explanation: isRCT ? 'Adequate randomization and blinding verified with low attrition bias' : (isAnimal ? 'Animal model cannot replicate human cortical architecture' : 'Non-randomized observational design with potential residual confounding')
        },
        consensusAlignment: isContradictory ? 'Contradicts Prevailing Data' : (isAnimal || isSimulation ? 'Neutral / Inconclusive' : 'Supports Consensus'),
        synthesizedKeyFinding: isContradictory 
          ? `Primary endpoint showed no statistically significant cognitive benefit (p=${pValue}).`
          : `Significant reduction in ${randomEndpoint} progression with neuroprotective stabilization.`
      }
    };

    papers.push(newPaper);
    currentId++;
  }

  return papers;
}

function createPaperFromSeed(seed: any, id: string, versionId: string, groupId: string): ResearchPaper {
  return {
    id,
    title: seed.title,
    abstract: seed.abstract,
    authors: seed.authors,
    year: seed.year,
    journal: seed.journal,
    pmid: seed.pmid,
    doi: seed.doi,
    source: 'pubmed',
    queryVersionIds: [versionId],
    groupId,
    isRepresentative: true,
    hidden: false,
    language: seed.isNonEnglish ? 'fre' : 'eng',
    publicationTypes: seed.isRCT ? ['Randomized Controlled Trial', 'Clinical Trial'] : [seed.isCaseReport ? 'Case Report' : 'Comparative Study'],
    picoSpans: generateSpans(seed.abstract, 'Semaglutide / GLP-1 RA', 'Cognitive Decline & Biomarkers', seed.isAnimal),
    aiBadges: generateBadges(seed.isRCT, seed.sampleSize, seed.pValue, seed.isContradictory, seed.isAnimal, seed.isSimulation, seed.isCaseReport),
    deepAnalysis: {
      studyDesign: seed.isRCT ? "Multicenter Double-Blind Randomized Controlled Trial" : (seed.isAnimal ? "Preclinical In Vivo Rodent Model" : "Observational Target Trial Emulation"),
      sampleSize: seed.sampleSize,
      dosageDuration: "Active treatment vs matching placebo over 12-104 weeks",
      primaryEffectMetric: seed.effectMetric,
      pValue: seed.pValue,
      endpointSummary: "Cognitive function (CDR-SB, ADAS-Cog), cortical atrophy rates, and fluid biomarkers",
      statisticalRigorScore: seed.isRCT ? 95 : (seed.sampleSize > 10000 ? 88 : 65),
      biasAssessment: {
        riskLevel: seed.isRCT ? 'Low' : (seed.isAnimal || seed.isSimulation || seed.isCaseReport ? 'High' : 'Moderate'),
        explanation: seed.isRCT ? "High-grade randomized trial with pre-specified intention-to-treat protocol" : "Observational or non-human setting"
      },
      consensusAlignment: seed.isContradictory ? 'Contradicts Prevailing Data' : 'Supports Consensus',
      synthesizedKeyFinding: seed.isContradictory 
        ? "No statistically significant cognitive benefit detected; high gastrointestinal intolerance."
        : "Clinically meaningful deceleration of cognitive decline alongside structural brain preservation."
    }
  };
}

function generateSpans(abstract: string, molecule: string, endpoint: string, isAnimal: boolean): PICOSpan[] {
  const spans: PICOSpan[] = [];
  
  // Find Population
  const popMatch = abstract.match(/patients with [^.]+|participants with [^.]+|adults aged [^.]+|APP\/PS1 transgenic mice/i);
  if (popMatch && popMatch.index !== undefined) {
    spans.push({
      id: `p-${Math.random()}`,
      type: 'P',
      label: 'Population',
      text: popMatch[0],
      startIndex: popMatch.index,
      endIndex: popMatch.index + popMatch[0].length,
      confidence: 0.94
    });
  }

  // Find Intervention
  const intMatch = abstract.match(/semaglutide|liraglutide|tirzepatide|exenatide|GLP-1 receptor agonist/i);
  if (intMatch && intMatch.index !== undefined) {
    spans.push({
      id: `i-${Math.random()}`,
      type: 'I',
      label: 'Intervention',
      text: intMatch[0],
      startIndex: intMatch.index,
      endIndex: intMatch.index + intMatch[0].length,
      confidence: 0.98
    });
  }

  // Find Comparator
  const compMatch = abstract.match(/placebo|matching placebo|DPP-4 inhibitors|non-treated controls/i);
  if (compMatch && compMatch.index !== undefined) {
    spans.push({
      id: `c-${Math.random()}`,
      type: 'C',
      label: 'Comparator',
      text: compMatch[0],
      startIndex: compMatch.index,
      endIndex: compMatch.index + compMatch[0].length,
      confidence: 0.91
    });
  }

  // Find Outcome
  const outMatch = abstract.match(/CDR-SB|ADAS-Cog|cognitive decline|atrophy|p-tau181|incidence of dementia|escape latency/i);
  if (outMatch && outMatch.index !== undefined) {
    spans.push({
      id: `o-${Math.random()}`,
      type: 'O',
      label: 'Outcome',
      text: outMatch[0],
      startIndex: outMatch.index,
      endIndex: outMatch.index + outMatch[0].length,
      confidence: 0.93
    });
  }

  return spans;
}

function generateBadges(
  isRCT: boolean, 
  sampleSize: number, 
  pValue: number, 
  isContradictory: boolean,
  isAnimal: boolean,
  isSimulation: boolean,
  isCaseReport: boolean
): AIBadge[] {
  const badges: AIBadge[] = [];

  if (isRCT) {
    badges.push({
      id: `b-rct-${Math.random()}`,
      type: 'rct_gold',
      label: 'Gold Standard RCT',
      variant: 'gold',
      badgeIcon: 'Award',
      whySnippet: 'Double-blind, randomized, placebo-controlled clinical trial design verified in methods protocol.',
      textEvidence: 'In this double-blind, randomized, placebo-controlled phase 3 trial...',
      confidence: 0.98,
      category: 'Quality'
    });
  }

  if (sampleSize >= 500) {
    badges.push({
      id: `b-pwr-${Math.random()}`,
      type: 'high_power',
      label: `High Sample Power (N=${sampleSize.toLocaleString()})`,
      variant: 'blue',
      badgeIcon: 'BarChart2',
      whySnippet: `Sample cohort (N=${sampleSize.toLocaleString()}) exceeds the statistical power threshold of 500 participants, providing high effect precision.`,
      textEvidence: `Enrolled cohort of ${sampleSize.toLocaleString()} participants across clinical trial sites.`,
      confidence: 0.99,
      category: 'Sample'
    });
  }

  if (isContradictory) {
    badges.push({
      id: `b-cnt-${Math.random()}`,
      type: 'contradiction',
      label: 'Divergent / Null Finding',
      variant: 'rose',
      badgeIcon: 'AlertTriangle',
      whySnippet: `Reports non-significant cognitive effect (p=${pValue}), directly contrasting with prevailing positive efficacy meta-analyses.`,
      textEvidence: `No statistically significant differences between groups were observed (p=${pValue}).`,
      confidence: 0.92,
      category: 'Finding'
    });
  }

  if (!isAnimal && !isSimulation && !isCaseReport && isRCT) {
    badges.push({
      id: `b-pico-${Math.random()}`,
      type: 'pico_concordance',
      label: 'Direct PICO Concordance',
      variant: 'purple',
      badgeIcon: 'Target',
      whySnippet: 'Matches all four target systematic review criteria: adult human cohort, GLP-1 RA therapy, placebo control, and validated cognitive scores.',
      textEvidence: 'Evaluated cognitive decline in early-stage human participants using validated scales.',
      confidence: 0.96,
      category: 'Relevance'
    });
  }

  if (isAnimal || isSimulation || isCaseReport) {
    badges.push({
      id: `b-bias-${Math.random()}`,
      type: 'bias_risk',
      label: isAnimal ? 'Animal Preclinical' : (isSimulation ? 'In Silico Simulation' : 'N=1 Case Report'),
      variant: 'amber',
      badgeIcon: 'ShieldAlert',
      whySnippet: isAnimal 
        ? 'Preclinical animal model; lacks human clinical cognitive translation and validation.'
        : (isSimulation ? 'Purely computational in silico model without biological in vivo data.' : 'Single-subject observation lacks statistical generalizability.'),
      textEvidence: isAnimal ? 'Evaluated in Sprague-Dawley rats and murine models.' : 'Computational atomic simulations.',
      confidence: 0.95,
      category: 'Risk'
    });
  }

  return badges;
}

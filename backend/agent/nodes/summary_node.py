from langchain_core.prompts import ChatPromptTemplate

from agent.schemas.main import AgentState
from agent.model.llm import load_llm


def summary(state: AgentState) -> dict:

    model = load_llm()

    prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
               "You are an expert in summarizing study notes. Your task is to generate a concise and informative summary based on the analysis result provided. The summary should capture the main points, key takeaways, and essential information from the analysis. Ensure that the summary is clear, coherent, and easy to understand.",
            ),
            ("human", "Analysis Result: {analysis_result}"),
        ]
    )

    # Format the prompt using state attributes
    formatted_prompt = prompt.invoke(
        {
            "analysis_result": state.analysis_result,
        }
    )

    # Invoke model and return response
    response = model.invoke(formatted_prompt)

    return {"summary_result": response.content}


if __name__ == "__main__":
    # Example usage
    state = AgentState(
        note_id="note_001",
        note_title="The Impact of Climate Change on Biodiversity",
        note_subject="Environmental Science",
        note_content="Climate change has significant effects on biodiversity. Rising temperatures, changing precipitation patterns, and increased frequency of extreme weather events can lead to habitat loss, species migration, and extinction. Conservation efforts are essential to mitigate these impacts.",
        analysis_result="'Analysis Report: The Impact of Climate Change on Biodiversity\n\n1) Summary\nThe study notes highlight that climate change profoundly affects biodiversity through rising temperatures, altered precipitation patterns, and more frequent extreme weather events. These changes drive habitat loss, force species to migrate or shift their ranges, and increase the risk of extinction. Conservation efforts are essential to mitigate these impacts, aiming to protect and preserve biodiversity in the face of changing environmental conditions.\n\n2) Key Concepts\n- Biodiversity\n  - Definition: The variety and variability of life in all its forms, levels (genetic, species, ecosystem), and processes.\n  - Relevance: Biodiversity underpins ecosystem services, resilience, and the stability of ecosystems in a changing climate.\n\n- Climate Change\n  - Definition: Long-term shifts in temperature, precipitation, and related climate variables caused by human activities (primarily greenhouse gas emissions) and natural factors.\n  - Relevance: It is the primary driver of the changes described in the notes (temperature rise, precipitation changes, more extreme events).\n\n- Temperature Rise\n  - Definition: Increased average and extremes in ambient temperatures.\n  - Relevance: Alters species’ physiology, phenology, and geographic ranges.\n\n- Altered Precipitation Patterns\n  - Definition: Changes in rainfall quantity, timing, and seasonality.\n  - Relevance: Affects water availability, habitat suitability, and ecosystem productivity.\n\n- Extreme Weather Events\n  - Definition: More frequent/intense events such as droughts, floods, storms, and heatwaves.\n  - Relevance: Causes direct mortality, habitat destruction, and ecosystem disruption.\n\n- Habitat Loss\n  - Definition: Reduction or fragmentation of natural habitats reducing the area or quality of living spaces for species.\n  - Relevance: A primary mechanism by which climate change reduces biodiversity.\n\n- Species Migration / Range Shifts\n  - Definition: Movement of species toward higher latitudes or elevations in response to climate changes.\n  - Relevance: Shifts can create mismatches with available resources, disrupt communities, or be constrained by barriers.\n\n- Extinction\n  - Definition: The permanent loss of a species; can be local (extirpation) or global.\n  - Relevance: The most irreversible consequence of rapid or severe environmental change.\n\n- Conservation Efforts\n  - Definition: Strategies and actions aimed at protecting, preserving, and restoring biodiversity.\n  - Relevance: Essential for reducing climate-related biodiversity loss; includes both mitigation and adaptation components.\n\n- Additional Related Concepts (explanations for context)\n  - Ecological Niche: The role and position of a species within its environment, including habitat, resources, and interactions.\n  - Range Shifts vs. Habitat Suitability: Shifts depend on suitable habitat connectivity; fragmentation can impede movement.\n  - Resilience and Adaptive Capacity: The ability of ecosystems and species to absorb disturbances and recover; influenced by diversity, redundancy, and management actions.\n  - Connectivity and Corridors: Landscape linkages that enable movement and genetic exchange between populations.\n\n3) Important Details\n- Drivers of Biodiversity Impact\n  - Rising temperatures, changing precipitation, and increasing frequency of extreme weather events disrupt habitat conditions and resource availability.\n  - These drivers collectively contribute to habitat loss, prompting species to migrate or face higher extinction risk.\n\n- Consequences for Species and Ecosystems\n  - Habitat loss reduces available living space and can fragment populations, leading to smaller, isolated groups.\n  - Species migration and range shifts may outpace the ability of some species to disperse, adapt, or find suitable habitats, increasing vulnerability.\n  - Extinction risk rises for specialists with narrow ecological niches or limited dispersal abilities.\n\n- Conservation as a Mitigation Strategy\n  - Protecting critical habitats to maintain essential resources and refugia for at-risk species.\n  - Enhancing connectivity through landscape-scale planning and creating ecological corridors to facilitate safe migration and gene flow.\n  - Restoring degraded ecosystems to improve resilience and provide alternative habitats.\n  - Incorporating climate considerations into conservation planning (e.g., protecting climate refugia, prioritizing areas with high future suitability).\n  - Integrating ex situ (cultivated in captivity or controlled environments) and in situ (within natural habitats) approaches as needed.\n  - Reducing co-stressors (pollution, overexploitation, invasive species) to bolster species’ adaptive capacity.\n\n- Examples for Illustration (not provided in original notes but helpful for comprehension)\n  - Coral reefs: Warming ocean temperatures lead to coral bleaching and reef degradation, illustrating how climate change can rapidly reduce biodiversity in marine systems.\n  - Alpine and polar species: Elevational or latitudinal range shifts to cooler areas may occur, but limited habitat availability and barriers can lead to local extinctions.\n  - Migratory birds: Shifts in seasonal timing can create mismatches with food resources, affecting survival and reproduction.\n\n- Practical Implications for Policy and Practice\n  - Climate-informed conservation planning is essential, recognizing that static protected areas may not suffice as species move.\n  - Monitoring and adaptive management are key to updating conservation strategies as climate conditions change.\n  - Collaboration across sectors (land use planning, water management, agriculture, and urban development) enhances the effectiveness of biodiversity protection under climate change.\n\nOverall, the notes present a concise causal chain: climate change (temperature rise, precipitation changes, extreme events) drives habitat loss and species movements, increasing extinction risk, with conservation efforts as the necessary response to mitigate these impacts.'",
        summary_result="",
        key_concepts=[],
        generated_questions=[],
    )
    summary_result = summary(state)
    print(summary_result)

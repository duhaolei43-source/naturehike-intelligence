# Power BI — UNVERIFIED model and report design

The main pipeline and Streamlit run on Apple Silicon macOS. Power BI is optional. No supported Windows Desktop/Fabric model connection was available. No functioning report, PBIX, screenshots or DAX parity is claimed. No binary PBIX is fabricated.

Validated CSV/Parquet exports are in data/public/processed. Model design, measure definitions and a numerical verification plan are under model_spec/. project/STATUS.md documents the unimplemented runtime artifact. Authoring can begin when a supported Windows/Fabric environment is available; create a real PBIP with TMDL semantic definitions and PBIR report definitions, then open/test it.

Official references reviewed on 2026-10-13:
- [Microsoft Skills for Fabric](https://github.com/microsoft/skills-for-fabric), commit bc42aaf734771bf752c1d7082dd91e5a6ca72b9f.
- [Semantic authoring skill](https://github.com/microsoft/skills-for-fabric/blob/bc42aaf734771bf752c1d7082dd91e5a6ca72b9f/skills/semantic-model-authoring/SKILL.md), modeling and DAX guidelines at that commit.
- [Power BI report skill](https://github.com/microsoft/skills-for-fabric/blob/bc42aaf734771bf752c1d7082dd91e5a6ca72b9f/skills/powerbi-report-cli/SKILL.md).
- [Official modeling MCP](https://github.com/microsoft/powerbi-modeling-mcp).
- [Star-schema guidance](https://learn.microsoft.com/en-us/power-bi/guidance/star-schema).
- [PBIP overview](https://learn.microsoft.com/en-us/power-bi/developer/projects/projects-overview).

No unknown scripts were installed or executed, no unsupported local server was added, and no duplicated MCP was configured. Source Python/SQL retain the requested snake_case physical names; proposed Power BI display names are business-friendly. Relationships/measures must be validated in the actual runtime before the status changes to VERIFIED.

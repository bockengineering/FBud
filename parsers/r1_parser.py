from .base_parser import BudgetParser, ParsedDocument
from .xlsx_display_parser import DisplayWorkbookConfig, DisplayWorkbookParser


class R1Parser(BudgetParser):
    document_type = "r1"

    def parse(self, workbook_path: str) -> ParsedDocument:
        return DisplayWorkbookParser(
            DisplayWorkbookConfig(
                document_type="r1",
                document_id="fy2027-r1-display",
                title="FY 2027 R-1 Research, Development, Test and Evaluation Programs Display",
                appropriation_type="RDT&E",
                sheet_candidates=("Exhibit R-1",),
                source_filename="r1_display.xlsx",
            ),
        ).parse(workbook_path)

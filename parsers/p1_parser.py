from .base_parser import BudgetParser, ParsedDocument
from .xlsx_display_parser import DisplayWorkbookConfig, DisplayWorkbookParser


class P1Parser(BudgetParser):
    document_type = "p1"

    def parse(self, workbook_path: str) -> ParsedDocument:
        return DisplayWorkbookParser(
            DisplayWorkbookConfig(
                document_type="p1",
                document_id="fy2027-p1-display",
                title="FY 2027 P-1 Procurement Programs Display",
                appropriation_type="Procurement",
                sheet_candidates=("Exhibit P-1",),
                source_filename="p1_display.xlsx",
            ),
        ).parse(workbook_path)

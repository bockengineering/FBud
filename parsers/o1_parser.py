from .base_parser import BudgetParser, ParsedDocument
from .xlsx_display_parser import DisplayWorkbookConfig, DisplayWorkbookParser


class O1Parser(BudgetParser):
    document_type = "o1"

    def parse(self, workbook_path: str) -> ParsedDocument:
        return DisplayWorkbookParser(
            DisplayWorkbookConfig(
                document_type="o1",
                document_id="fy2027-o1-display",
                title="FY 2027 O-1 Operation and Maintenance Programs Display",
                appropriation_type="O&M",
                sheet_candidates=("OM Title plus Indefinite", "OM Title"),
                source_filename="o1_display.xlsx",
            ),
        ).parse(workbook_path)

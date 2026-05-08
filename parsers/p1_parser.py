from .base_parser import BudgetParser, ParsedDocument


class P1Parser(BudgetParser):
    document_type = "p1"

    def parse(self, pdf_path: str) -> ParsedDocument:
        raise NotImplementedError("P-1 ingestion is reserved for the next data source.")

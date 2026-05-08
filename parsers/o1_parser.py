from .base_parser import BudgetParser, ParsedDocument


class O1Parser(BudgetParser):
    document_type = "o1"

    def parse(self, pdf_path: str) -> ParsedDocument:
        raise NotImplementedError("O-1 ingestion is reserved for the next data source.")

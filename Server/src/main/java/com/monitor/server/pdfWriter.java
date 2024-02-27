package com.monitor.server;
import java.awt.image.BufferedImage;
import java.io.FileOutputStream;
import java.nio.file.Path;
import java.sql.*;
import java.util.Date;

import com.itextpdf.text.*;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfTemplate;
import com.itextpdf.text.pdf.PdfWriter;
import org.jfree.chart.ChartFactory;
import org.jfree.chart.JFreeChart;
import org.jfree.chart.plot.PlotOrientation;
import org.jfree.data.category.DefaultCategoryDataset;
import org.jfree.data.xy.DefaultXYDataset;


public class pdfWriter implements Runnable {
    private static String FILE = "src/main/resources/test.pdf";
    private static Font catFont = new Font(Font.FontFamily.TIMES_ROMAN, 18,
            Font.BOLD);
    private static Font redFont = new Font(Font.FontFamily.TIMES_ROMAN, 12,
            Font.NORMAL, BaseColor.RED);
    private static Font subFont = new Font(Font.FontFamily.TIMES_ROMAN, 16,
            Font.BOLD);
    private static Font smallBold = new Font(Font.FontFamily.TIMES_ROMAN, 12,
            Font.BOLD);
    private static Connection con;
    private static PdfWriter writer;
    public pdfWriter(Connection con) {
        this.con = con;
    }

    public void run() {
        System.out.println(pdfWriter.class.getResource("/"));
        try {
            Document document = new Document();
            writer = PdfWriter.getInstance(document, new FileOutputStream(FILE));
            document.open();
            addMetaData(document);
            addTitlePage(document);
            addContent(document);
            document.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    //testing purposes only//
    public static void main(String[] args){
        System.out.println(pdfWriter.class.getResource("/"));
        try {
            Document document = new Document();
            writer = PdfWriter.getInstance(document, new FileOutputStream(FILE));
            document.open();
            addMetaData(document);
            addTitlePage(document);
            addContent(document);
            document.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    // iText allows to add metadata to the PDF which can be viewed in your Adobe
    // Reader
    // under File -> Properties
    private static void addMetaData(Document document) {
        document.addTitle("Daily report");
        document.addSubject("test");
        document.addKeywords("Java, PDF, iText");
        document.addAuthor("Lars Vogel");
        document.addCreator("Lars Vogel");
    }

    private static void addTitlePage(Document document)
            throws DocumentException {
        //main page to add content
        Paragraph main = new Paragraph();
        addEmptyLine(main, 1);
        //add tilte
        Paragraph title = new Paragraph("Daily report", catFont);
        title.setAlignment(Element.ALIGN_CENTER);
        main.add(title);
        addEmptyLine(main, 1);
        //add env subheading
        Paragraph subEnv = new Paragraph("Environmental recap", catFont);
        subEnv.setAlignment(Element.ALIGN_LEFT);
        main.add(subEnv);
        addEmptyLine(main, 1);
        //peak temperatures for each room
        DefaultCategoryDataset dataset = new DefaultCategoryDataset();
        try{
            //needs SQL tweaking
            PreparedStatement selectStatement = con.prepareStatement(
                    "SELECT room_id,MAX(temperature) as temp FROM roomEnvironment GROUP BY room_id"
            );
            ResultSet rs = selectStatement.executeQuery();
            while(rs.next()){
                int temp = rs.getInt("temp");
                //int noise = rs.getInt("noise");
                //int light = rs.getInt("light");
                //Time time = rs.getTime("timestamp");
                dataset.addValue(temp,String.valueOf(rs.getInt("room_id")),String.valueOf(rs.getInt("room_id")));
            }
        }catch (Exception e){e.printStackTrace();}


        JFreeChart chart = ChartFactory.createBarChart("Temperature","time","temp",dataset, PlotOrientation.VERTICAL,false,false,false);
        BufferedImage bufferedImage = chart.createBufferedImage(250,250);
        try{
            Image image = Image.getInstance(writer,bufferedImage,1.0f);
            main.add(image);

        }catch (Exception e){e.printStackTrace();}

        //add location subheading
        addEmptyLine(main,10);
        Paragraph subLoc = new Paragraph("Location recap", catFont);
        subLoc.setAlignment(Element.ALIGN_RIGHT);
        main.add(subLoc);
        addEmptyLine(main, 1);



        document.add(main);
    }

    private static void addContent(Document document) throws DocumentException {
        Paragraph tilte = new Paragraph();
        tilte.add(new Paragraph("Environmental recap", catFont));

        // Second parameter is the number of the chapter
        Chapter catPart = new Chapter(tilte, 1);
        catPart.setNumberDepth(0);
        Section subCatPart = catPart.addSection(new Paragraph(),0);
        // add a table
        createTable(subCatPart);

        // now add all this to the document
        document.add(catPart);

        // now add all this to the document
        document.add(catPart);

    }

    private static void createTable(Section subCatPart)
            throws BadElementException {
        PdfPTable table = new PdfPTable(3);

        // t.setBorderColor(BaseColor.GRAY);
        // t.setPadding(4);
        // t.setSpacing(4);
        // t.setBorderWidth(1);

        PdfPCell c1 = new PdfPCell(new Phrase("Table Header 1"));
        c1.setHorizontalAlignment(Element.ALIGN_CENTER);
        table.addCell(c1);

        c1 = new PdfPCell(new Phrase("Table Header 2"));
        c1.setHorizontalAlignment(Element.ALIGN_CENTER);
        table.addCell(c1);

        c1 = new PdfPCell(new Phrase("Table Header 3"));
        c1.setHorizontalAlignment(Element.ALIGN_CENTER);
        table.addCell(c1);
        table.setHeaderRows(1);

        table.addCell("1.0");
        table.addCell("1.1");
        table.addCell("1.2");
        table.addCell("2.1");
        table.addCell("2.2");
        table.addCell("2.3");

        subCatPart.add(table);

    }

    private static void createList(Section subCatPart) {
        List list = new List(true, false, 10);
        list.add(new ListItem("First point"));
        list.add(new ListItem("Second point"));
        list.add(new ListItem("Third point"));
        subCatPart.add(list);
    }

    private static void addEmptyLine(Paragraph paragraph, int number) {
        for (int i = 0; i < number; i++) {
            paragraph.add(new Paragraph(" "));
        }
    }
}
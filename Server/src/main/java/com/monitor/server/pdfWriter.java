package com.monitor.server;
import java.awt.image.BufferedImage;
import java.io.FileOutputStream;
import java.nio.file.Path;
import java.sql.*;
import java.text.DateFormat;
import java.text.NumberFormat;
import java.text.SimpleDateFormat;
import java.time.LocalDate;

import com.itextpdf.text.*;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfTemplate;
import com.itextpdf.text.pdf.PdfWriter;
import org.jfree.chart.ChartFactory;
import org.jfree.chart.JFreeChart;
import org.jfree.chart.axis.CategoryLabelPosition;
import org.jfree.chart.axis.CategoryLabelPositions;
import org.jfree.chart.labels.CategoryItemLabelGenerator;
import org.jfree.chart.labels.ItemLabelAnchor;
import org.jfree.chart.labels.ItemLabelPosition;
import org.jfree.chart.labels.StandardCategoryItemLabelGenerator;
import org.jfree.chart.plot.CategoryPlot;
import org.jfree.chart.plot.PlotOrientation;
import org.jfree.chart.renderer.category.CategoryItemRenderer;
import org.jfree.chart.text.TextBlockAnchor;
import org.jfree.chart.ui.HorizontalAlignment;
import org.jfree.chart.ui.RectangleAnchor;
import org.jfree.chart.ui.TextAnchor;
import org.jfree.data.category.CategoryDataset;
import org.jfree.data.category.DefaultCategoryDataset;
import org.jfree.data.general.Dataset;
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

        //add graphs to main page
        main.add(createGraph("Temperature"));
        main.add(createGraph("Noise_level"));
        main.add(createGraph("Light_level"));

        //add location subheading
        addEmptyLine(main,10);
        Paragraph subLoc = new Paragraph("Location recap", catFont);
        subLoc.setAlignment(Element.ALIGN_RIGHT);
        main.add(subLoc);
        addEmptyLine(main, 1);



        document.add(main);
    }
    private static Image createGraph(String type){
        try{
            DefaultCategoryDataset dataset = new DefaultCategoryDataset();
            //get the peak values for the type of graph wanted
            PreparedStatement selectStatement = con.prepareStatement(
                    "SELECT ANY_VALUE(timestamp) as time,room_name,MAX("+type+") as value FROM roomEnvironment env " +
                            "JOIN rooms r ON env.room_id=r.room_id GROUP BY room_name"
            );
            ResultSet rs = selectStatement.executeQuery();
            while(rs.next()){
                //get all the values and format time
                int value = (int) rs.getDouble("value");
                Time t= rs.getTime("time");
                String time  = new SimpleDateFormat("HH:mm").format(t);
                String name = rs.getString("room_name")+"\n"+time;
                //add to dataset for the graph
                dataset.addValue(value,name,name);
            }
            //create chart and size title//
            JFreeChart chart = null;
            if(type.equals("Temperature")){
                chart = ChartFactory.createStackedBarChart("Peak Temperature","","Temperature °C",dataset, PlotOrientation.VERTICAL,false,false,false);
            } else if (type.equals("Noise_level")) {
                chart = ChartFactory.createStackedBarChart("Peak Noise Level","","Noise Level",dataset, PlotOrientation.VERTICAL,false,false,false);

            } else if (type.equals("Light_level")) {
                chart = ChartFactory.createStackedBarChart("Peak Light level","","Light Level",dataset, PlotOrientation.VERTICAL,false,false,false);
            }
            chart.getTitle().setHorizontalAlignment(HorizontalAlignment.CENTER);
            chart.getTitle().setFont(new java.awt.Font("SansSerif", java.awt.Font.BOLD, 15));
            //if more than 4 datasets then change text to be verticle and size correctly
            if(dataset.getRowCount()>4){
                chart.getCategoryPlot().getDomainAxis().setCategoryLabelPositions(CategoryLabelPositions.DOWN_90);
                chart.getCategoryPlot().getDomainAxis().setTickLabelFont(new java.awt.Font("SansSerif", java.awt.Font.BOLD, 9));
                chart.getCategoryPlot().getDomainAxis().setMaximumCategoryLabelLines(3);
            }else{//otherwise size correctly horizontal
                chart.getCategoryPlot().getDomainAxis().setCategoryLabelPositions(CategoryLabelPositions.STANDARD);
                chart.getCategoryPlot().getDomainAxis().setTickLabelFont(new java.awt.Font("SansSerif", java.awt.Font.BOLD, 11));
                chart.getCategoryPlot().getDomainAxis().setMaximumCategoryLabelLines(2);
            }
            //setup text inside of bar chart
            CategoryPlot plot = chart.getCategoryPlot();
            CategoryItemRenderer renderer = plot.getRenderer();
            CategoryItemLabelGenerator generator = new StandardCategoryItemLabelGenerator("{2}", NumberFormat.getInstance());
            //size and format correctly
            renderer.setDefaultItemLabelGenerator(generator);
            renderer.setDefaultItemLabelFont(new java.awt.Font("SansSerif", java.awt.Font.PLAIN, 12));
            renderer.setDefaultItemLabelsVisible(true);
            renderer.setDefaultPositiveItemLabelPosition(new ItemLabelPosition(ItemLabelAnchor.CENTER, TextAnchor.CENTER, TextAnchor.CENTER, - 0 / 2));
            //create image
            BufferedImage bufferedImage = chart.createBufferedImage(500,200);
                //return created image
            return Image.getInstance(writer,bufferedImage,1.0f);
        }catch (Exception e){
            e.printStackTrace();
        }
        return null;
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